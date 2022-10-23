import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";
import { createRedisInstance } from "../../../server/redis";


const reqSchema = z.object({
  vehicle_serial: z.string().optional(),
  takeoff_before: z.string().optional(),
  takeoff_since: z.string().optional(),
  page_number: z.number().int().default(1),
  per_page: z.number().int().default(25),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = reqSchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({ errors: query.error.issues });
    return;
  }
  const redis = createRedisInstance();
  const key = `flights:${JSON.stringify(req.query)}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const where = {
    vehicle_serial: query.data.vehicle_serial,
    takeoff_time: {
      gte: query.data.takeoff_since,
      lte: query.data.takeoff_before,
    }
  }

  const flights = await prisma.flight.findMany({
    where: where,
    skip: (query.data.page_number - 1) * query.data.per_page,
    take: query.data.per_page,
  });

  const total = await prisma.flight.count({where: where});

  const out = {
    pagination: {
      current_page: query.data.page_number,
      max_per_page: query.data.per_page,
      total_pages: Math.ceil(total / query.data.per_page),
    },
    flights: flights
  }

  await redis.set(key, JSON.stringify(out), `PX`, 60_000 * 60);
  res.status(200).json(out);
}


export default handler

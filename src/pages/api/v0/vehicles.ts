// src/pages/api/vehicle.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";
import { createRedisInstance } from "../../../server/redis";

const vehicleReqSchema = z.object({
  vehicle_serial: z.string().optional(),
  vehicle_type: z.enum(["R1", "R3", "E1"]).optional(),
  vehicle_class: z.enum(["Skydio R1", "Skydio 2", "Skydio X2"]).optional(),
  user_email: z.string().email().optional(),
  page_number: z.number().int().default(1),
  per_page: z.number().int().default(25),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = vehicleReqSchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({ errors: query.error.issues });
    return;
  }
  const redis = createRedisInstance();
  const key = `vehicles:${JSON.stringify(req.query)}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const where = {
    vehicle_serial: query.data.vehicle_serial,
    vehicle_type: query.data.vehicle_type,
    vehicle_class: query.data.vehicle_class,
    user_emails: query.data.user_email ? {
      hasSome: query.data.user_email,
    } : undefined,
  }

  const vehicles = await prisma.vehicle.findMany({
    where: where,
    skip: (query.data.page_number - 1) * query.data.per_page,
    take: query.data.per_page,
  });

  const total = await prisma.vehicle.count({where: where});

  const out = {
    pagination: {
      current_page: query.data.page_number,
      max_per_page: query.data.per_page,
      total_pages: Math.ceil(total / query.data.per_page),
    },
    vehicles: vehicles
  }

  await redis.set(key, JSON.stringify(out), `PX`, 60_000 * 60);
  res.status(200).json(out);
};

export default handler;

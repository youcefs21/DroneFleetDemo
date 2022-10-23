import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../server/db/client";
import { z } from "zod";
import { createRedisInstance } from "../../../../../server/redis";

const reqSchema = z.object({
  cuid: z.string(),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  const query = reqSchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({ errors: query.error.issues });
    return;
  }
  const redis = createRedisInstance();
  const key = `flight:${JSON.stringify(req.query)}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const flight = await prisma.flight.findUnique({
    where: {id: query.data.cuid },
  })

  const out = { flight: flight }
  await redis.set(key, JSON.stringify(out), `PX`, 60_000 * 60);
  res.status(200).json(out)
}


export default handler

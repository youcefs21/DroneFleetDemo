import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { z } from "zod";
import { createRedisInstance } from "../../../../server/redis";

const stringVerify = z.string()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  const vehicle_serial  = stringVerify.safeParse(req.query.vehicle_serial);

  if (!vehicle_serial.success) {
    res.status(400).json({ errors: vehicle_serial.error.issues });
    return;
  }
  const redis = createRedisInstance();
  const key = `vehicle:${JSON.stringify(req.query)}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { vehicle_serial: vehicle_serial.data },
  })

  const out = { vehicle: vehicle }
  await redis.set(key, JSON.stringify(out), `PX`, 60_000 * 60);
  res.status(200).json(out)
}


export default handler

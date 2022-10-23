import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { z } from "zod";
import { createRedisInstance } from "../../../../server/redis";

const stringVerify = z.string()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  const cuid = stringVerify.safeParse(req.query.cuid);

  if (!cuid.success) {
    res.status(400).json({ errors: cuid.error.issues });
    return;
  }
  const redis = createRedisInstance();
  const key = `user:${JSON.stringify(req.query)}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const user = await prisma.user.findUnique({
    where: {id: cuid.data },
  })

  const out = { user: user }
  await redis.set(key, JSON.stringify(out), `PX`, 60_000 * 60);
  res.status(200).json(out)
}


export default handler

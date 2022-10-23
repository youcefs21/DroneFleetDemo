import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";
import { createRedisInstance } from "../../../server/redis";


const reqSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  organization_role: z.enum(["UNKNOWN", "MEMBER", "TESTER", "MODERATOR", "ADMIN"]).optional(),
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
  const key = `users:${JSON.stringify(req.query)}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const where = {
    first_name: query.data.first_name,
    last_name: query.data.last_name,
    email: query.data.email,
    organization_role: query.data.organization_role,
  }

  const users = await prisma.user.findMany({
    where: where,
    skip: (query.data.page_number - 1) * query.data.per_page,
    take: query.data.per_page,
  });

  const total = await prisma.user.count({where: where});


  const out = {
    pagination: {
      current_page: query.data.page_number,
      max_per_page: query.data.per_page,
      total_pages: Math.ceil(total / query.data.per_page),
    },
    users: users
  }
  const MAX_AGE = 60_000 * 60; // 1 hour
  const EXPIRY_MS = `PX`; // milliseconds
  await redis.set(key, JSON.stringify(out), EXPIRY_MS, MAX_AGE);

  res.status(200).json(out);
}


export default handler

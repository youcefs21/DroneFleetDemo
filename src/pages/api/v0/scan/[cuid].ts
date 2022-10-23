import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { z } from "zod";
import { createRedisInstance } from "../../../../server/redis";

const reqSchema = z.object({
  cuid: z.string(),
  files_page_number: z.number().int().default(1),
  files_per_page: z.number().int().default(25),
  pre_signed_download_url: z.boolean().optional(),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  const query = reqSchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({ errors: query.error.issues });
    return;
  }
  const redis = createRedisInstance();
  const key = `scan:${JSON.stringify(req.query)}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const scan = await prisma.scan.findUnique({
    where: {scan_id: query.data.cuid },
    include: {
      flight: true,
      files: {
        skip: (query.data.files_page_number - 1) * query.data.files_per_page,
        take: query.data.files_per_page,
      }
    }
  })

  const out = { scan: scan }
  await redis.set(key, JSON.stringify(out), `PX`, 60_000 * 60);
  res.status(200).json(out)
}


export default handler

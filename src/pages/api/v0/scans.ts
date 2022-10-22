import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";


const reqSchema = z.object({
  flight_id: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
  user_id: z.string().optional(),
  vehicle_serial: z.string().optional(),
  scanned_before: z.string().optional(),
  scanned_since: z.string().optional(),
  pre_signed_download_url: z.boolean().optional(),
  page_number: z.number().int().default(1),
  per_page: z.number().int().default(25),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = reqSchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({ errors: query.error.issues });
    return;
  }

  const where = {
    flight_id: query.data.flight_id,
    latitude: query.data.radius && query.data.latitude ? {
      gte: query.data.latitude - query.data.radius,
      lte: query.data.latitude + query.data.radius,
    } : query.data.latitude,
    longitude: query.data.radius && query.data.longitude ? {
      gte: query.data.longitude - query.data.radius,
      lte: query.data.longitude + query.data.radius,
    }: query.data.longitude,
    user_id: query.data.user_id,
    vehicle_serial: query.data.vehicle_serial,
    scan_time: {
      gte: query.data.scanned_since,
      lte: query.data.scanned_before,
    },
  }

  const scans = await prisma.scan.findMany({
    where: where,
    include: {
      flight: true,
    },
    skip: (query.data.page_number - 1) * query.data.per_page,
    take: query.data.per_page,
  });


  if (query.data.pre_signed_download_url) {
    // TODO: add pre-signed download url
  }

  const total = await prisma.scan.count({where: where});

  res.status(200).json({
    pagination: {
      current_page: query.data.page_number,
      max_per_page: query.data.per_page,
      total_pages: Math.ceil(total / query.data.per_page),
    },
    scans: scans
  });
}


export default handler

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";


const reqSchema = z.object({
  vehicle_serial: z.string().optional(),
  flight_id: z.string().optional(),
  kind: z.array(z.enum([
    "vehicleVideoRaw", "vehicleImageDng", "videoTelemetryCsv", "undisortedImage", "vehicleVideoPreview", "photogrammetryMesh", "vehicleImage"
  ])).optional(),
  uploaded_before: z.string().optional(),
  uploaded_since: z.string().optional(),
  pre_signed_download_url: z.boolean().optional(),
  mission_run_cuid: z.string().optional(),
  mission_template_cuid: z.string().optional(),
  mission_waypoint_name: z.string().optional(),
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
    flight: {
      vehicle_serial: query.data.vehicle_serial,
    },
    flight_id: query.data.flight_id,
    kind: query.data.kind ? {
      in: query.data.kind,
    } : undefined,
    createdAt: {
      gte: query.data.uploaded_since,
      lte: query.data.uploaded_before,
    },
    mission_run_id: query.data.mission_run_cuid,
    mission_run: {
      mission_template_id: query.data.mission_template_cuid,
      mission_waypoints: {
        some: {
          name: query.data.mission_waypoint_name,
        }
      }
    }
  }

  const media = await prisma.media.findMany({
    where: where,
    skip: (query.data.page_number - 1) * query.data.per_page,
    take: query.data.per_page,
  });

  const total = await prisma.media.count({where: where});

  res.status(200).json({
    pagination: {
      current_page: query.data.page_number,
      max_per_page: query.data.per_page,
      total_pages: Math.ceil(total / query.data.per_page),
    },
    files: media
  });
}


export default handler


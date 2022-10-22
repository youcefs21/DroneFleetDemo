// src/pages/api/vehicle.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";

const vehicleReqSchema = z.object({
  vehicle_serial: z.string().optional(),
  vehicle_type: z.enum(["R1", "R3", "E1"]).optional(),
  vehicle_class: z.enum(["Skydio R1", "Skydio 2", "Skydio X2"]).optional(),
  user_email: z.string().email().optional(),
  page_number: z.number().int().default(1),
  per_page: z.number().int().default(25),
});

const vehicle = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = vehicleReqSchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({ errors: query.error.issues });
    return;
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      vehicle_serial: query.data.vehicle_serial,
      vehicle_type: query.data.vehicle_type,
      vehicle_class: query.data.vehicle_class,
      user_emails: {
        has: query.data.user_email,
      },
    }
  });

  res.status(200).json(vehicles);
};

export default vehicle;

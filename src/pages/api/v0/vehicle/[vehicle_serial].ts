import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { z } from "zod";

const stringVerify = z.string()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  const vehicle_serial  = stringVerify.safeParse(req.query.vehicle_serial);

  if (!vehicle_serial.success) {
    res.status(400).json({ errors: vehicle_serial.error.issues });
    return;
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { vehicle_serial: vehicle_serial.data },
  })

  res.status(200).json({ vehicle: vehicle })
}


export default handler

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../server/db/client";
import { z } from "zod";

const reqSchema = z.object({
  cuid: z.string(),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  const query = reqSchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({ errors: query.error.issues });
    return;
  }

  const flight = await prisma.flight.findUnique({
    where: {id: query.data.cuid },
  })

  res.status(200).json({flight: flight})
}


export default handler

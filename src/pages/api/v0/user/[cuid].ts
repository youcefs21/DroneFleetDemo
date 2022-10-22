import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { z } from "zod";

const stringVerify = z.string()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  const cuid = stringVerify.safeParse(req.query.cuid);

  if (!cuid.success) {
    res.status(400).json({ errors: cuid.error.issues });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {id: cuid.data },
  })

  res.status(200).json({ user: user })
}


export default handler

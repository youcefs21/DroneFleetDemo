import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  res.status(501).json({ errors: "Not implemented" });
}


export default handler

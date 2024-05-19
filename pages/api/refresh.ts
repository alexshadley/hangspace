import type { NextApiRequest, NextApiResponse } from "next";
import { pgClient } from "../../util/PgClient";
import { queryPosts } from "../../util/queries";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("in refersh.ts");

  const posts = await queryPosts();

  res.status(200).json({

    messages: posts,

  });


}
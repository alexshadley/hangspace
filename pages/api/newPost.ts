import type { NextApiRequest, NextApiResponse } from "next";
import { pgClient } from "../../util/PgClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  var data = req.body;

  data = JSON.parse(data);
  console.log(data.userId);

  //   const id = await createItem(data)
  console.log("hi mom!");
  res.status(200).json({});

  var result = await pgClient.query(`
    insert into posts (content, user_id) values 
    ('${data.message}', ${data.userId});   
  `);
}

import type { NextApiRequest, NextApiResponse } from "next";
import { pgClient } from "../../util/PgClient";
import formidable from "formidable";
import fs from "fs";
import AWS from "aws-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import { v4 } from "uuid";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing, we will handle it with formidable
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const form = formidable({});

  console.log("about to parse");
  const [data, files] = await form.parse(req);
  console.log("finish parse");

  var result = await pgClient.query(
    `
    insert into posts (content, user_id) values 
    ($1, $2)
    returning id;   
  `,
    [data.message[0], data.userId[0]]
  );
  const postId = result.rows[0].id;

  if (files?.file) {
    console.log("filepath", files.file[0].filepath);
    const fileStream = fs.createReadStream(files.file[0].filepath);

    const fileKey = v4(); // uuid.v4();

    const params = {
      Bucket: "hangspaces",
      Key: fileKey,
      Body: fileStream,
      ContentType: files.file[0].mimetype, // Set content type
    };

    const s3 = new S3Client({
      credentials: fromEnv(),
      region: process.env.AWS_REGION,
    });

    console.log("start upload");
    await s3.send(new PutObjectCommand(params));
    console.log("finish upload");

    const url = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    console.log("uploaded!!!", url);

    var result = await pgClient.query(
      `
          insert into images (post_id, s3_url) values 
            ($1, $2);   
      `,
      [postId, url]
    );
  }

  console.log("status 200");
  res.status(200).json({ ok: true });
}

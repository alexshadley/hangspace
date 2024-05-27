import type { NextApiRequest, NextApiResponse } from "next";
import { pgClient } from "../../util/PgClient";
import formidable from "formidable";
import fs from "fs";
import AWS from "aws-sdk";
import {v4} from 'uuid';

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


  var result = await pgClient.query(`
    insert into posts (content, user_id) values 
    ('${data.message}', ${data.userId})
    returning id;   
  `);
  const postId = result.rows[0].id;

  if (files?.file) {
    console.log("filepath", files.file[0].filepath);
    const fileStream = fs.createReadStream(files.file[0].filepath);

    const fileKey = v4(); // uuid.v4();

    const params = {
      Bucket: "hangspaces",
      Key: fileKey,
      Body: fileStream,
      ContentType: files.file[0].mimetype // Set content type
    };

    //Configure AWS SDK
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const s3 = new AWS.S3();
    s3.putObject(params, async (err, data) =>  {
      if (err) {
        console.error(err);
        return res.status(500).send({ error: "Error uploading file" });
      }

      const url = `https://${params.Bucket}.s3.${AWS.config.region}.amazonaws.com/${params.Key}`;
      console.log('uploaded!!!', url);

      var result = await pgClient.query(`
          insert into images (post_id, s3_url) values 
            ($1, $2);   
      `, [postId, url]) ;

    });
  }

  res.status(200).json({});
}

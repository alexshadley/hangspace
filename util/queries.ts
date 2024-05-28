import { pgClient } from "../util/PgClient";

export async function queryPosts(showCount: string = "5") {
  var sample = parseInt(showCount);
  if (!sample) {
    sample = 5;
  }

  const posts = await pgClient.query(`
    SELECT 
      users.name,
      posts.content,
      posts.created_ts,
      images.s3_url
    FROM posts
    JOIN users ON posts.user_id = users.id
    LEFT JOIN images ON images.post_id = posts.id
    ORDER BY posts.created_ts DESC
    LIMIT ${sample};
  `);

  // TODO
  //
  // const childPosts = await pgClient.query(
  //   `
  //   SELECT posts.id, posts.parent_id, users.name, posts.content, TO_CHAR(posts.created_ts AT TIME ZONE 'UTC' AT TIME ZONE 'America/Chicago','MM-DD HH:MI') as created_ts FROM posts
  //   JOIN users ON posts.user_id = users.id
  //   WHERE posts.parent_id IN ($1);
  // `,
  //   [posts.rows.map((r) => parseInt(r.id))]
  // );

  // TODO
  //
  //   return posts.rows.map((r) => ({
  //     userName: r.name,
  //     content: r.content,
  //     created_ts: r.created_ts,
  //     childPosts: childPosts.rows
  //       .filter((child) => child.parent_id === r.id)
  //       .map((child) => ({
  //         userName: child.name,
  //         content: child.content,
  //         created_ts: child.created_ts,
  //       })),
  //   }));

  return posts.rows.map((r) => ({
    userName: r.name,
    content: r.content,
    created_ts: r.created_ts.getTime(),
    s3Url: r.s3_url,
  }));
}

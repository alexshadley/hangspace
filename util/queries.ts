import { pgClient } from "../util/PgClient";

export async function queryPosts() {
  const posts = await pgClient.query(`
    SELECT posts.id, users.name, posts.content, TO_CHAR(posts.created_ts AT TIME ZONE 'UTC' AT TIME ZONE 'America/Chicago','MM-DD HH:MI') as created_ts FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE posts.parent_id IS NULL
    ORDER BY created_ts DESC
    LIMIT 1;
  `);

  const childPosts = await pgClient.query(
    `
    SELECT posts.id, posts.parent_id, users.name, posts.content, TO_CHAR(posts.created_ts AT TIME ZONE 'UTC' AT TIME ZONE 'America/Chicago','MM-DD HH:MI') as created_ts FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE posts.parent_id IN ($1);
  `,
    [posts.rows.map((r) => parseInt(r.id))]
  );

  return posts.rows.map((r) => ({
    userName: r.name,
    content: r.content,
    created_ts: r.created_ts,
    childPosts: childPosts.rows
      .filter((child) => child.parent_id === r.id)
      .map((child) => ({
        userName: child.name,
        content: child.content,
        created_ts: child.created_ts,
      })),
  }));
}

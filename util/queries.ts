import { pgClient } from "../util/PgClient";

export async function queryPosts() {
  const posts = await pgClient.query(`
    SELECT users.name, posts.content, TO_CHAR(posts.created_ts AT TIME ZONE 'UTC' AT TIME ZONE 'America/Chicago','MM-DD HH:MI') as created_ts FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY created_ts DESC
    LIMIT 5;
  `);


//   SELECT 
//   id, 
//   event_name, 
//   TO_CHAR(event_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York', 'YYYY-MM-DD HH24:MI:SS') AS event_date_str
// FROM events;


  
  return posts.rows.map((r) => ({
        userName: r.name,
        content: r.content,
        created_ts: r.created_ts,
      }));
}

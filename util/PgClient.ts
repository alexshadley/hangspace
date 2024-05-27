import { Client } from "pg";

export const pgClient = new Client({
  user: process.env.DB_USER ?? "postgres",
  database: process.env.DB_NAME ?? "dev",
});
await pgClient.connect();

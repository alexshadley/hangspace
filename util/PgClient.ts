import { Client } from "pg";

export const pgClient = new Client(
  process.env.POSTGRES_URL
    ? {
        connectionString: process.env.POSTGRES_URL,
      }
    : {
        user: process.env.DB_USER ?? "postgres",
        database: process.env.DB_NAME ?? "dev",
      }
);

// TODO: this seems to work, figure out how to get rid of error
// @ts-expect-error
await pgClient.connect();

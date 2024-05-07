import {Client} from 'pg';

export const pgClient = new Client({user: 'postgres', database: 'dev'});
await pgClient.connect();

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../lib/env";
import { schema } from "./schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production",
});

export const db = drizzle(pool, { schema });

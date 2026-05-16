import postgres from "postgres";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const sql = postgres(databaseUrl, { ssl: "require" });

export default sql;
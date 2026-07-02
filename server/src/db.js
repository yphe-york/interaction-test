import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is missing from the environment variables.",
    );
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // Allow additional time for Neon to wake from suspension.
    connectionTimeoutMillis: 30000,

    idleTimeoutMillis: 30000,
    max: 5,
    keepAlive: true,
});

pool.on("connect", () => {
    console.log("Connected to Neon PostgreSQL.");
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error);
});

export default pool;
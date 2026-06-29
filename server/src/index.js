import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Allow requests without an Origin, such as API testing tools.
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Origin is not allowed by CORS."));
        },
        methods: ["GET", "POST", "PATCH"],
        allowedHeaders: ["Content-Type"],
    }),
);

app.use(express.json({ limit: "100kb" }));

app.get("/", (request, response) => {
    response.json({
        success: true,
        message: "Interaction Consistency Study API",
    });
});

app.get("/api/health", async (request, response) => {
    try {
        const result = await pool.query("SELECT NOW() AS database_time");

        response.json({
            success: true,
            databaseTime: result.rows[0].database_time,
        });
    } catch (error) {
        console.error("Health-check error:", error);

        response.status(500).json({
            success: false,
            message: "Database connection failed.",
        });
    }
});

// Vercel detects and deploys the exported Express application.
export default app;

// Used only for local development.
if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 5000;

    app.listen(port, () => {
        console.log(`API running at http://localhost:${port}`);
    });
}
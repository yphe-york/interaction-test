import "dotenv/config";
import express from "express";
import cors from "cors";

import pool from "./db.js";
import trialRoutes from "./routes/trials.js";
import resultsRoutes from "./routes/results.js";

const app = express();

const PORT = Number(process.env.PORT) || 5001;

/*
 * Remove trailing slashes so the origin comparison is consistent.
 */
const productionClientUrl = process.env.CLIENT_URL?.replace(/\/$/, "");

const allowedOrigins = [
    "http://localhost:3000",
    productionClientUrl,
].filter(Boolean);

/*
 * CORS configuration
 *
 * Allows:
 * - Local Next.js frontend
 * - Deployed Vercel frontend from CLIENT_URL
 * - Requests without an Origin header, such as curl or Postman
 */
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            const error = new Error(`Origin ${origin} is not allowed by CORS.`);
            error.status = 403;

            return callback(error);
        },
        methods: ["GET", "POST", "PATCH"],
        allowedHeaders: ["Content-Type", "X-API-Key"],
    }),
);

/*
 * Parse JSON request bodies.
 */
app.use(express.json({ limit: "100kb" }));

/*
 * Basic API information.
 */
app.get("/", (request, response) => {
    response.json({
        success: true,
        message: "Interaction Consistency Study API",
    });
});

/*
 * Check the Express server and Neon database connection.
 */
app.get("/api/health", async (request, response) => {
    try {
        const result = await pool.query(`
      SELECT
        NOW() AS database_time,
        current_database() AS database_name
    `);

        return response.json({
            success: true,
            message: "API and database are connected.",
            databaseTime: result.rows[0].database_time,
            databaseName: result.rows[0].database_name,
        });
    } catch (error) {
        console.error("Health check error:", error);

        return response.status(500).json({
            success: false,
            message: "The API is running, but the database connection failed.",
        });
    }
});

/*
 * Trial routes:
 *
 * POST  /api/trials/start
 * PATCH /api/trials/:trialId/complete
 */
app.use("/api/trials", trialRoutes);

/*
 * Protected results route:
 *
 * GET /api/results
 */
app.use("/api/results", resultsRoutes);

/*
 * Handle unknown routes.
 */
app.use((request, response) => {
    return response.status(404).json({
        success: false,
        message: "Route not found.",
    });
});

/*
 * General Express error handler.
 *
 * Express error middleware must have all four parameters,
 * including `next`.
 */
app.use((error, request, response, next) => {
    console.error("Unexpected server error:", error);

    const status = error.status || 500;

    return response.status(status).json({
        success: false,
        message:
            status === 403
                ? "Request origin is not allowed."
                : "An unexpected server error occurred.",
    });
});

/*
 * Render provides process.env.PORT in production.
 * The server must bind to 0.0.0.0 on Render.
 */
app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running on port ${PORT}`);
    console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
});
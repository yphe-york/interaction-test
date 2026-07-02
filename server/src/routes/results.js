import express from "express";
import pool from "../db.js";

const router = express.Router();

const VALID_CONDITIONS = [
    "HPC-HOC",
    "HPC-LOC",
    "LPC-HOC",
    "LPC-LOC",
];

const VALID_TASKS = [
    "checkout",
    "change-password",
    "support-ticket",
];

const VALID_STATUSES = [
    "started",
    "completed",
    "abandoned",
];

/*
 * GET /api/results
 *
 * Protected endpoint for retrieving experiment results.
 *
 * Optional query parameters:
 * participantId
 * condition
 * taskName
 * status
 * limit
 */
router.get("/", async (request, response) => {
    try {
        const providedApiKey = request.get("x-api-key");
        const expectedApiKey = process.env.RESULTS_API_KEY;

        if (!expectedApiKey) {
            console.error("RESULTS_API_KEY is not configured.");

            return response.status(500).json({
                success: false,
                message: "Results access is not configured.",
            });
        }

        if (!providedApiKey || providedApiKey !== expectedApiKey) {
            return response.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        const {
            participantId,
            condition,
            taskName,
            status,
            limit = "500",
        } = request.query;

        if (condition && !VALID_CONDITIONS.includes(condition)) {
            return response.status(400).json({
                success: false,
                message: "Invalid condition filter.",
            });
        }

        if (taskName && !VALID_TASKS.includes(taskName)) {
            return response.status(400).json({
                success: false,
                message: "Invalid task filter.",
            });
        }

        if (status && !VALID_STATUSES.includes(status)) {
            return response.status(400).json({
                success: false,
                message: "Invalid status filter.",
            });
        }

        const parsedLimit = Number(limit);

        if (
            !Number.isInteger(parsedLimit) ||
            parsedLimit < 1 ||
            parsedLimit > 1000
        ) {
            return response.status(400).json({
                success: false,
                message: "Limit must be between 1 and 1000.",
            });
        }

        const conditions = [];
        const values = [];

        if (participantId) {
            values.push(String(participantId).trim());
            conditions.push(`participant_id = $${values.length}`);
        }

        if (condition) {
            values.push(condition);
            conditions.push(`condition = $${values.length}`);
        }

        if (taskName) {
            values.push(taskName);
            conditions.push(`task_name = $${values.length}`);
        }

        if (status) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        values.push(parsedLimit);

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        const result = await pool.query(
            `
        SELECT
          id,
          participant_id,
          condition,
          task_name,
          trial_order,
          start_device,
          completion_device,
          started_at,
          completed_at,
          completion_time_ms,
          accuracy,
          status
        FROM study_trials
        ${whereClause}
        ORDER BY id DESC
        LIMIT $${values.length}
      `,
            values,
        );

        const results = result.rows.map((trial) => ({
            id: trial.id,
            participantId: trial.participant_id,
            condition: trial.condition,
            taskName: trial.task_name,
            trialOrder: trial.trial_order,
            startDevice: trial.start_device,
            completionDevice: trial.completion_device,
            startedAt: trial.started_at,
            completedAt: trial.completed_at,
            completionTimeMs:
                trial.completion_time_ms === null
                    ? null
                    : Number(trial.completion_time_ms),
            accuracy: trial.accuracy,
            status: trial.status,
        }));

        return response.json({
            success: true,
            count: results.length,
            results,
        });
    } catch (error) {
        console.error("Retrieve results error:", error);

        return response.status(500).json({
            success: false,
            message: "Unable to retrieve results.",
        });
    }
});

export default router;
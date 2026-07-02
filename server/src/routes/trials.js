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

const VALID_DEVICES = ["desktop", "mobile", "tablet"];

/*
 * POST /api/trials/start
 *
 * Creates a new trial when a participant begins a task.
 */
router.post("/start", async (request, response) => {
    try {
        const {
            participantId,
            condition,
            taskName,
            trialOrder,
            startDevice,
        } = request.body;

        const cleanedParticipantId = participantId?.trim();

        if (!cleanedParticipantId) {
            return response.status(400).json({
                success: false,
                message: "Participant ID is required.",
            });
        }

        if (cleanedParticipantId.length > 50) {
            return response.status(400).json({
                success: false,
                message: "Participant ID must not exceed 50 characters.",
            });
        }

        if (!VALID_CONDITIONS.includes(condition)) {
            return response.status(400).json({
                success: false,
                message: "Invalid experimental condition.",
            });
        }

        if (!VALID_TASKS.includes(taskName)) {
            return response.status(400).json({
                success: false,
                message: "Invalid task name.",
            });
        }

        if (
            trialOrder !== undefined &&
            trialOrder !== null &&
            (!Number.isInteger(trialOrder) || trialOrder < 1)
        ) {
            return response.status(400).json({
                success: false,
                message: "Trial order must be a positive integer.",
            });
        }

        if (startDevice && !VALID_DEVICES.includes(startDevice)) {
            return response.status(400).json({
                success: false,
                message: "Invalid start device.",
            });
        }

        const result = await pool.query(
            `
        INSERT INTO study_trials (
          participant_id,
          condition,
          task_name,
          trial_order,
          start_device,
          status
        )
        VALUES ($1, $2, $3, $4, $5, 'started')
        RETURNING
          id,
          participant_id,
          condition,
          task_name,
          trial_order,
          start_device,
          status,
          started_at
      `,
            [
                cleanedParticipantId,
                condition,
                taskName,
                trialOrder ?? null,
                startDevice ?? null,
            ],
        );

        const trial = result.rows[0];

        return response.status(201).json({
            success: true,
            message: "Trial started successfully.",
            trial: {
                id: trial.id,
                participantId: trial.participant_id,
                condition: trial.condition,
                taskName: trial.task_name,
                trialOrder: trial.trial_order,
                startDevice: trial.start_device,
                status: trial.status,
                startedAt: trial.started_at,
            },
        });
    } catch (error) {
        console.error("Start trial error:", error);

        return response.status(500).json({
            success: false,
            message: "Unable to start the trial.",
        });
    }
});

/*
 * PATCH /api/trials/:trialId/complete
 *
 * Completes an existing trial and calculates completion time
 * using the server/database timestamps.
 */
router.patch("/:trialId/complete", async (request, response) => {
    try {
        const { trialId } = request.params;
        const { accuracy, completionDevice } = request.body;

        if (!/^[1-9]\d*$/.test(trialId)) {
            return response.status(400).json({
                success: false,
                message: "Invalid trial ID.",
            });
        }

        if (accuracy !== 0 && accuracy !== 1) {
            return response.status(400).json({
                success: false,
                message: "Accuracy must be either 0 or 1.",
            });
        }

        if (!VALID_DEVICES.includes(completionDevice)) {
            return response.status(400).json({
                success: false,
                message: "Invalid completion device.",
            });
        }

        const result = await pool.query(
            `
        UPDATE study_trials
        SET
          completed_at = CURRENT_TIMESTAMP,

          completion_time_ms = (
            ROUND(
              EXTRACT(
                EPOCH FROM (
                  CURRENT_TIMESTAMP - started_at
                )
              ) * 1000
            )
          )::BIGINT,

          accuracy = $1,
          completion_device = $2,
          status = 'completed'

        WHERE
          id = $3
          AND status = 'started'

        RETURNING
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
      `,
            [accuracy, completionDevice, trialId],
        );

        if (result.rowCount === 0) {
            const existingTrial = await pool.query(
                `
          SELECT
            id,
            status
          FROM study_trials
          WHERE id = $1
        `,
                [trialId],
            );

            if (existingTrial.rowCount === 0) {
                return response.status(404).json({
                    success: false,
                    message: "Trial not found.",
                });
            }

            return response.status(409).json({
                success: false,
                message: `This trial cannot be completed because its status is "${existingTrial.rows[0].status}".`,
            });
        }

        const trial = result.rows[0];

        return response.json({
            success: true,
            message: "Trial completed successfully.",
            trial: {
                id: trial.id,
                participantId: trial.participant_id,
                condition: trial.condition,
                taskName: trial.task_name,
                trialOrder: trial.trial_order,
                startDevice: trial.start_device,
                completionDevice: trial.completion_device,
                startedAt: trial.started_at,
                completedAt: trial.completed_at,
                completionTimeMs: Number(trial.completion_time_ms),
                accuracy: trial.accuracy,
                status: trial.status,
            },
        });
    } catch (error) {
        console.error("Complete trial error:", error);

        return response.status(500).json({
            success: false,
            message: "Unable to complete the trial.",
        });
    }
});

export default router;
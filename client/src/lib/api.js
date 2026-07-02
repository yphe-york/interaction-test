const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/$/, "");

/**
 * Sends a request to the Express backend.
 */
async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const contentType = response.headers.get("content-type");

    const data = contentType?.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new Error(
            data?.message || `Request failed with status ${response.status}.`,
        );
    }

    return data;
}

/**
 * Confirms that Express and Neon are available.
 */
export async function checkApiHealth() {
    return apiRequest("/api/health", {
        method: "GET",
    });
}

/**
 * Creates a new trial when a participant begins a task.
 */
export async function startTrial({
                                     participantId,
                                     condition,
                                     taskName,
                                     trialOrder,
                                     startDevice,
                                 }) {
    if (!participantId) {
        throw new Error("Participant ID is required.");
    }

    return apiRequest("/api/trials/start", {
        method: "POST",
        body: JSON.stringify({
            participantId,
            condition,
            taskName,
            trialOrder,
            startDevice,
        }),
    });
}

/**
 * Completes an existing trial.
 *
 * accuracy:
 * 1 = successful/correct
 * 0 = unsuccessful/incorrect
 */
export async function completeTrial({
                                        trialId,
                                        accuracy,
                                        completionDevice,
                                    }) {
    if (!trialId) {
        throw new Error("Trial ID is required.");
    }

    return apiRequest(`/api/trials/${trialId}/complete`, {
        method: "PATCH",
        body: JSON.stringify({
            accuracy,
            completionDevice,
        }),
    });
}
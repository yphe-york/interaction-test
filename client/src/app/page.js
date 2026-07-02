"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const TASK_ROUTES = {
  task1: "/checkout",
  task2: "/change-password",
  task3: "/support-ticket",
};

export default function HomePage() {
  const router = useRouter();

  const [participantId, setParticipantId] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const cleanedParticipantId = participantId
        .trim()
        .toUpperCase();

    if (!cleanedParticipantId) {
      setError("Please enter your participant ID.");
      return;
    }

    if (cleanedParticipantId.length > 50) {
      setError(
          "Participant ID must not exceed 50 characters.",
      );
      return;
    }

    if (!selectedDevice) {
      setError("Please select a device.");
      return;
    }

    if (!selectedTask) {
      setError("Please select a task.");
      return;
    }

    const taskRoute = TASK_ROUTES[selectedTask];

    if (!taskRoute) {
      setError("The selected task is not valid.");
      return;
    }

    sessionStorage.setItem(
        "participantId",
        cleanedParticipantId,
    );

    sessionStorage.setItem(
        "selectedDevice",
        selectedDevice,
    );

    sessionStorage.setItem(
        "selectedTask",
        selectedTask,
    );

    /*
     * Mobile tasks begin with the first condition:
     * HPC-HOC.
     */
    if (selectedDevice === "mobile") {
      sessionStorage.setItem("conditionIndex", "0");
    } else {
      sessionStorage.removeItem("conditionIndex");
    }

    /*
     * Clear any unfinished trial IDs left from testing
     * or a previous task session.
     */
    sessionStorage.removeItem("activeTrialId");

    router.push(taskRoute);
  }

  function clearError() {
    if (error) {
      setError("");
    }
  }

  return (
      <main className={styles.page}>
        <section className={styles.card}>
          <header className={styles.header}>
            <p className={styles.studyLabel}>
              Research Study
            </p>

            <h1>
              Welcome to the Interaction Consistency Study
            </h1>

            <p className={styles.description}>
              Enter the information provided by the researcher to
              begin the selected study task.
            </p>
          </header>

          <form
              className={styles.form}
              onSubmit={handleSubmit}
          >
            <div className={styles.field}>
              <label htmlFor="participantId">
                Participant ID
              </label>

              <input
                  id="participantId"
                  name="participantId"
                  type="text"
                  value={participantId}
                  onChange={(event) => {
                    setParticipantId(event.target.value);
                    clearError();
                  }}
                  placeholder="001"
                  autoComplete="off"
                  autoFocus
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="device">
                Select device
              </label>

              <select
                  id="device"
                  name="device"
                  value={selectedDevice}
                  onChange={(event) => {
                    setSelectedDevice(event.target.value);
                    clearError();
                  }}
              >
                <option value="">
                  Choose a device
                </option>

                <option value="desktop">
                  Desktop
                </option>

                <option value="mobile">
                  Mobile
                </option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="task">
                Select task
              </label>

              <select
                  id="task"
                  name="task"
                  value={selectedTask}
                  onChange={(event) => {
                    setSelectedTask(event.target.value);
                    clearError();
                  }}
              >
                <option value="">
                  Choose a task
                </option>

                <option value="task1">
                  Task 1
                </option>

                <option value="task2">
                  Task 2
                </option>

                <option value="task3">
                  Task 3
                </option>
              </select>
            </div>

            {error && (
                <p className={styles.errorMessage}>
                  {error}
                </p>
            )}

            <button
                type="submit"
                className={styles.submitButton}
            >
              Begin Task
            </button>
          </form>

          <p className={styles.privacyNote}>
            Enter only the participant ID provided by the
            researcher. Do not enter your name, email address, or
            other personal information.
          </p>
        </section>
      </main>
  );
}
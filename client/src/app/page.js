"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const TASK_ROUTES = {
  task1: "/checkout",
  task2: "/change-password",
  task3: "/support-ticket",
};

function DesktopIcon() {
  return (
      <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={styles.optionIconSvg}
      >
        <rect
            x="2.5"
            y="3.5"
            width="19"
            height="13"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        />

        <path
            d="M8 20h8M12 16.5V20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
      </svg>
  );
}

function MobileIcon() {
  return (
      <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={styles.optionIconSvg}
      >
        <rect
            x="7"
            y="2.5"
            width="10"
            height="19"
            rx="2.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        />

        <path
            d="M10 5h4M11 18.5h2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
      </svg>
  );
}

function ArrowIcon() {
  return (
      <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={styles.buttonIcon}
      >
        <path
            d="M4 10h11M11 6l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
  );
}

export default function HomePage() {
  const router = useRouter();

  const [participantId, setParticipantId] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [error, setError] = useState("");

  function clearError() {
    if (error) {
      setError("");
    }
  }

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

    if (selectedDevice === "mobile") {
      sessionStorage.setItem("conditionIndex", "0");
    } else {
      sessionStorage.removeItem("conditionIndex");
    }

    sessionStorage.removeItem("activeTrialId");

    router.push(taskRoute);
  }

  return (
      <main className={styles.page}>
        <section className={styles.card}>
          <header className={styles.header}>
            <p className={styles.studyLabel}>
              Research Study
            </p>

            <h1>Interaction Consistency Study</h1>

            <p className={styles.description}>
              Enter the information provided by the researcher
              to begin your assigned task.
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
                  placeholder="For example, P001"
                  autoComplete="off"
                  autoFocus
              />
            </div>

            <fieldset className={styles.optionGroup}>
              <legend>Select device</legend>

              <div className={styles.deviceGrid}>
                <label
                    className={`${styles.choiceCard} ${
                        selectedDevice === "desktop"
                            ? styles.selectedCard
                            : ""
                    }`}
                >
                  <input
                      type="radio"
                      name="device"
                      value="desktop"
                      checked={selectedDevice === "desktop"}
                      onChange={(event) => {
                        setSelectedDevice(event.target.value);
                        clearError();
                      }}
                  />

                  <span className={styles.optionIcon}>
                  <DesktopIcon />
                </span>

                  <span className={styles.choiceContent}>
                  <strong>Desktop</strong>
                  <small>Computer browser</small>
                </span>

                  <span
                      className={styles.radioIndicator}
                      aria-hidden="true"
                  />
                </label>

                <label
                    className={`${styles.choiceCard} ${
                        selectedDevice === "mobile"
                            ? styles.selectedCard
                            : ""
                    }`}
                >
                  <input
                      type="radio"
                      name="device"
                      value="mobile"
                      checked={selectedDevice === "mobile"}
                      onChange={(event) => {
                        setSelectedDevice(event.target.value);
                        clearError();
                      }}
                  />

                  <span className={styles.optionIcon}>
                  <MobileIcon />
                </span>

                  <span className={styles.choiceContent}>
                  <strong>Mobile</strong>
                  <small>Mobile browser</small>
                </span>

                  <span
                      className={styles.radioIndicator}
                      aria-hidden="true"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className={styles.optionGroup}>
              <legend>Select task</legend>

              <div className={styles.taskGrid}>
                {["task1", "task2", "task3"].map(
                    (taskValue, index) => (
                        <label
                            key={taskValue}
                            className={`${styles.taskCard} ${
                                selectedTask === taskValue
                                    ? styles.selectedCard
                                    : ""
                            }`}
                        >
                          <input
                              type="radio"
                              name="task"
                              value={taskValue}
                              checked={selectedTask === taskValue}
                              onChange={(event) => {
                                setSelectedTask(event.target.value);
                                clearError();
                              }}
                          />

                          <span className={styles.taskNumber}>
                      {index + 1}
                    </span>

                          <span className={styles.taskLabel}>
                      Task {index + 1}
                    </span>

                          <span
                              className={styles.radioIndicator}
                              aria-hidden="true"
                          />
                        </label>
                    ),
                )}
              </div>
            </fieldset>

            {error && (
                <p
                    className={styles.errorMessage}
                    role="alert"
                >
                  {error}
                </p>
            )}

            <button
                type="submit"
                className={styles.submitButton}
            >
              <span>Begin task</span>
              <ArrowIcon />
            </button>
          </form>

          <p className={styles.privacyNote}>
            Enter only the participant ID provided by the
            researcher. Do not enter your name, email address,
            or other personal information.
          </p>
        </section>
      </main>
  );
}
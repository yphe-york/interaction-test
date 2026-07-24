"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const TASK_ROUTES = {
  task1: "/checkout",
  task2: "/change-password",
  task3: "/support-ticket",
};

const ROUND_OPTIONS = [
  {
    value: "1",
    label: "Round 1",
    selectedDevice: "desktop",
    conditionIndex: "0",
    condition: "HPC-HOC",
    conditionKey: "Desktop-HOC",
    consistency: "high",
  },
  {
    value: "2",
    label: "Round 2",
    selectedDevice: "desktop",
    conditionIndex: "1",
    condition: "HPC-LOC",
    conditionKey: "Desktop-LOC",
    consistency: "low",
  },
  {
    value: "3",
    label: "Round 3",
    selectedDevice: "mobile",
    conditionIndex: "0",
    condition: "HPC-HOC",
    conditionKey: "Mobile-HOC",
    consistency: "high",
  },
  {
    value: "4",
    label: "Round 4",
    selectedDevice: "mobile",
    conditionIndex: "1",
    condition: "HPC-LOC",
    conditionKey: "Mobile-LOC",
    consistency: "low",
  },
];

const TASK_OPTIONS = [
  {
    value: "task1",
    label: "Task 1",
    number: "1",
  },
  {
    value: "task2",
    label: "Task 2",
    number: "2",
  },
  {
    value: "task3",
    label: "Task 3",
    number: "3",
  },
];

function StoreIcon() {
  return (
      <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={styles.brandIcon}
      >
        <path
            d="M4 9h16l-1 11H5L4 9Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />

        <path
            d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9"
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
  const [selectedRound, setSelectedRound] = useState("");
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

    if (!selectedRound) {
      setError("Please select a round.");
      return;
    }

    if (!selectedTask) {
      setError("Please select a task.");
      return;
    }

    const roundConfig = ROUND_OPTIONS.find(
        (option) => option.value === selectedRound,
    );

    if (!roundConfig) {
      setError("The selected round is not valid.");
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
        "selectedRound",
        roundConfig.value,
    );

    sessionStorage.setItem(
        "selectedDevice",
        roundConfig.selectedDevice,
    );

    sessionStorage.setItem(
        "selectedTask",
        selectedTask,
    );

    sessionStorage.setItem(
        "conditionIndex",
        roundConfig.conditionIndex,
    );

    sessionStorage.setItem(
        "condition",
        roundConfig.condition,
    );

    sessionStorage.setItem(
        "conditionKey",
        roundConfig.conditionKey,
    );

    sessionStorage.setItem(
        "consistency",
        roundConfig.consistency,
    );

    sessionStorage.removeItem("activeTrialId");

    router.push(taskRoute);
  }

  return (
      <main className={styles.page}>
        <header className={styles.siteHeader}>
          <div className={styles.headerInner}>
            <div className={styles.brand}>
                        <span
                            className={styles.brandMark}
                            aria-hidden="true"
                        >
                            <StoreIcon />
                        </span>

              <span className={styles.brandText}>
                            <strong>MarketLane</strong>
                            <small>Online shopping</small>
                        </span>
            </div>

            <span className={styles.headerMessage}>
                        Shopping made simple
                    </span>
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.card}>
            <header className={styles.cardHeader}>
              <h1>Welcome to MarketLane</h1>

              <p>
                Enter your participant ID and select the
                round and task provided to you.
              </p>
            </header>

            <form
                className={styles.form}
                onSubmit={handleSubmit}
            >
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                                <span
                                    className={styles.sectionNumber}
                                    aria-hidden="true"
                                >
                                    1
                                </span>

                  <div className={styles.sectionCopy}>
                    <h2>Participant information</h2>

                    <p>
                      Enter the participant ID
                      provided to you.
                    </p>
                  </div>
                </div>

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
                        setParticipantId(
                            event.target.value,
                        );
                        clearError();
                      }}
                      placeholder="For example, P001"
                      autoComplete="off"
                      autoFocus
                  />
                </div>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                                <span
                                    className={styles.sectionNumber}
                                    aria-hidden="true"
                                >
                                    2
                                </span>

                  <div className={styles.sectionCopy}>
                    <h2>Select round</h2>

                    <p>
                      Select the round provided to
                      you.
                    </p>
                  </div>
                </div>

                <fieldset className={styles.optionGroup}>
                  <legend
                      className={styles.visuallyHidden}
                  >
                    Select round
                  </legend>

                  <div className={styles.roundGrid}>
                    {ROUND_OPTIONS.map(
                        (roundOption) => (
                            <label
                                key={roundOption.value}
                                className={`${
                                    styles.roundCard
                                } ${
                                    selectedRound ===
                                    roundOption.value
                                        ? styles.selectedCard
                                        : ""
                                }`}
                            >
                              <input
                                  type="radio"
                                  name="round"
                                  value={
                                    roundOption.value
                                  }
                                  checked={
                                      selectedRound ===
                                      roundOption.value
                                  }
                                  onChange={(
                                      event,
                                  ) => {
                                    setSelectedRound(
                                        event
                                            .target
                                            .value,
                                    );
                                    clearError();
                                  }}
                              />

                              <span
                                  className={
                                    styles.optionBadge
                                  }
                                  aria-hidden="true"
                              >
                                                    {
                                                      roundOption.value
                                                    }
                                                </span>

                              <span
                                  className={
                                    styles.optionLabel
                                  }
                              >
                                                    {
                                                      roundOption.label
                                                    }
                                                </span>

                              <span
                                  className={
                                    styles.radioIndicator
                                  }
                                  aria-hidden="true"
                              />
                            </label>
                        ),
                    )}
                  </div>
                </fieldset>
              </section>

              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                                <span
                                    className={styles.sectionNumber}
                                    aria-hidden="true"
                                >
                                    3
                                </span>

                  <div className={styles.sectionCopy}>
                    <h2>Select task</h2>

                    <p>
                      Select the task provided to
                      you.
                    </p>
                  </div>
                </div>

                <fieldset className={styles.optionGroup}>
                  <legend
                      className={styles.visuallyHidden}
                  >
                    Select task
                  </legend>

                  <div className={styles.taskGrid}>
                    {TASK_OPTIONS.map(
                        (taskOption) => (
                            <label
                                key={taskOption.value}
                                className={`${
                                    styles.taskCard
                                } ${
                                    selectedTask ===
                                    taskOption.value
                                        ? styles.selectedCard
                                        : ""
                                }`}
                            >
                              <input
                                  type="radio"
                                  name="task"
                                  value={
                                    taskOption.value
                                  }
                                  checked={
                                      selectedTask ===
                                      taskOption.value
                                  }
                                  onChange={(
                                      event,
                                  ) => {
                                    setSelectedTask(
                                        event
                                            .target
                                            .value,
                                    );
                                    clearError();
                                  }}
                              />

                              <span
                                  className={
                                    styles.optionBadge
                                  }
                                  aria-hidden="true"
                              >
                                                    {
                                                      taskOption.number
                                                    }
                                                </span>

                              <span
                                  className={
                                    styles.optionLabel
                                  }
                              >
                                                    {
                                                      taskOption.label
                                                    }
                                                </span>

                              <span
                                  className={
                                    styles.radioIndicator
                                  }
                                  aria-hidden="true"
                              />
                            </label>
                        ),
                    )}
                  </div>
                </fieldset>
              </section>

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
                <span>Continue</span>
                <ArrowIcon />
              </button>
            </form>

            <p className={styles.privacyNote}>
              Use only the participant ID provided to you.
              Do not enter your name, email address, or other
              personal information.
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
                        <span
                            className={styles.footerMark}
                            aria-hidden="true"
                        >
                            <StoreIcon />
                        </span>

              <span>
                            <strong>MarketLane</strong>
                            <small>Shopping made simple.</small>
                        </span>
            </div>

            <span className={styles.copyright}>
                        © 2026 MarketLane
                    </span>
          </div>
        </footer>
      </main>
  );
}
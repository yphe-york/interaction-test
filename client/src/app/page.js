"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();

  const [participantId, setParticipantId] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const cleanedId = participantId.trim();

    if (!cleanedId) {
      setError("Please enter your participant ID.");
      return;
    }

    sessionStorage.setItem("participantId", cleanedId);
    router.push("/tasks");
  }

  return (
      <main className={styles.homePage}>
        <section className={styles.welcomeCard}>
          <p className={styles.studyLabel}>Research Study</p>

          <h1>Welcome to the Interaction Consistency Study</h1>

          <p className={styles.studyDescription}>
            Please enter your participant ID to begin the study.
          </p>

          <form onSubmit={handleSubmit} className={styles.participantForm}>
            <label htmlFor="participantId">Participant ID</label>

            <input
                id="participantId"
                type="text"
                value={participantId}
                onChange={(event) => {
                  setParticipantId(event.target.value);
                  setError("");
                }}
                placeholder="For example: P01"
                autoComplete="off"
            />

            {error && <p className={styles.errorMessage}>{error}</p>}

            <button type="submit">Begin Study</button>
          </form>
        </section>
      </main>
  );
}
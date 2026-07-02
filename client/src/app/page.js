"use client";

import { useState } from "react";
import {
  checkApiHealth,
  startTrial,
  completeTrial,
} from "@/lib/api";
import { detectDevice } from "@/lib/device";

export default function TestLibPage() {
  const [trialId, setTrialId] = useState("");
  const [output, setOutput] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runTest(callback) {
    setLoading(true);
    setError("");

    try {
      const result = await callback();
      setOutput(result);
    } catch (caughtError) {
      console.error(caughtError);
      setError(caughtError.message);
    } finally {
      setLoading(false);
    }
  }

  function testDeviceDetection() {
    const result = {
      device: detectDevice(),
      width: window.innerWidth,
    };

    setOutput(result);
    setError("");
  }

  function testHealth() {
    runTest(() => checkApiHealth());
  }

  function testStartTrial() {
    runTest(async () => {
      const result = await startTrial({
        participantId: "LIB-TEST-001",
        condition: "HPC-HOC",
        taskName: "checkout",
        trialOrder: 1,
        startDevice: detectDevice(),
      });

      setTrialId(result.trial.id);

      return result;
    });
  }

  function testCompleteTrial() {
    if (!trialId) {
      setError("Start a trial first.");
      return;
    }

    runTest(() =>
        completeTrial({
          trialId,
          accuracy: 1,
          completionDevice: detectDevice(),
        }),
    );
  }

  return (
      <main
          style={{
            maxWidth: "700px",
            margin: "60px auto",
            padding: "24px",
            fontFamily: "Arial, sans-serif",
          }}
      >
        <h1>Library Test</h1>

        <p>
          Current trial ID: <strong>{trialId || "None"}</strong>
        </p>

        <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "24px",
            }}
        >
          <button onClick={testDeviceDetection} disabled={loading}>
            Test device
          </button>

          <button onClick={testHealth} disabled={loading}>
            Test API health
          </button>

          <button onClick={testStartTrial} disabled={loading}>
            Start test trial
          </button>

          <button onClick={testCompleteTrial} disabled={loading}>
            Complete test trial
          </button>
        </div>

        {loading && <p>Testing...</p>}

        {error && (
            <pre
                style={{
                  padding: "16px",
                  background: "#ffeaea",
                  color: "#a40000",
                  whiteSpace: "pre-wrap",
                }}
            >
          {error}
        </pre>
        )}

        {output && (
            <pre
                style={{
                  padding: "16px",
                  background: "#f1f3f5",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                }}
            >
          {JSON.stringify(output, null, 2)}
        </pre>
        )}
      </main>
  );
}
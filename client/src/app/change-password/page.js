"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { completeTrial, startTrial } from "@/lib/api";

const MOBILE_CONDITIONS = [
    "HPC-HOC",
    "HPC-LOC",
    "LPC-HOC",
    "LPC-LOC",
];

const PASSWORD_SCENARIOS = [
    {
        accountName: "Research Account A",
        currentPassword: "BlueSky!27",
        newPassword: "GreenLake!42",
    },
    {
        accountName: "Research Account B",
        currentPassword: "SilverMoon!31",
        newPassword: "OrangeTree!58",
    },
    {
        accountName: "Research Account C",
        currentPassword: "PurpleRain!64",
        newPassword: "GoldenSun!73",
    },
    {
        accountName: "Research Account D",
        currentPassword: "WinterRoad!46",
        newPassword: "SummerField!82",
    },
    {
        accountName: "Research Account E",
        currentPassword: "QuietRiver!19",
        newPassword: "BrightForest!65",
    },
];

const EMPTY_FORM = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

const HIDDEN_PASSWORDS = {
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
};

function calculateAccuracy(form, scenario) {
    const currentPasswordCorrect =
        form.currentPassword === scenario.currentPassword;

    const newPasswordCorrect =
        form.newPassword === scenario.newPassword;

    const confirmationCorrect =
        form.confirmPassword === scenario.newPassword;

    return currentPasswordCorrect &&
    newPasswordCorrect &&
    confirmationCorrect
        ? 1
        : 0;
}

export default function ChangePasswordPage() {
    const router = useRouter();

    const [studySession, setStudySession] = useState(null);
    const [trialId, setTrialId] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });

    const [visiblePasswords, setVisiblePasswords] = useState({
        ...HIDDEN_PASSWORDS,
    });

    const [screen, setScreen] = useState("instructions");
    const [error, setError] = useState("");

    useEffect(() => {
        const participantId =
            sessionStorage.getItem("participantId");

        const selectedDevice =
            sessionStorage.getItem("selectedDevice");

        const selectedTask =
            sessionStorage.getItem("selectedTask");

        if (
            !participantId ||
            !selectedDevice ||
            selectedTask !== "task2"
        ) {
            router.replace("/");
            return;
        }

        let conditionIndex = Number(
            sessionStorage.getItem("conditionIndex") || "0",
        );

        if (
            selectedDevice !== "mobile" ||
            conditionIndex < 0 ||
            conditionIndex >= MOBILE_CONDITIONS.length
        ) {
            conditionIndex = 0;
        }

        setStudySession({
            participantId,
            selectedDevice,
            conditionIndex,
        });
    }, [router]);

    if (!studySession) {
        return (
            <main className={styles.page}>
                <section className={styles.card}>
                    <p>Loading task...</p>
                </section>
            </main>
        );
    }

    const {
        participantId,
        selectedDevice,
        conditionIndex,
    } = studySession;

    const isMobile = selectedDevice === "mobile";

    const condition = isMobile
        ? MOBILE_CONDITIONS[conditionIndex]
        : "HPC-HOC";

    const isLOC =
        isMobile && condition.endsWith("LOC");

    const isLPC =
        isMobile && condition.startsWith("LPC");

    const scenarioIndex = isMobile
        ? conditionIndex + 1
        : 0;

    const scenario =
        PASSWORD_SCENARIOS[scenarioIndex] ||
        PASSWORD_SCENARIOS[0];

    const trialOrder = isMobile
        ? conditionIndex + 7
        : 6;

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));

        setError("");
    }

    function togglePasswordVisibility(fieldName) {
        setVisiblePasswords((currentState) => ({
            ...currentState,
            [fieldName]: !currentState[fieldName],
        }));
    }

    async function handleBeginTask() {
        setError("");
        setScreen("starting");

        try {
            const result = await startTrial({
                participantId,
                condition,
                taskName: "change-password",
                trialOrder,
                startDevice: selectedDevice,
            });

            setTrialId(result.trial.id);
            setScreen("password-form");
        } catch (caughtError) {
            console.error(
                "Unable to start password trial:",
                caughtError,
            );

            setError(
                caughtError.message ||
                "Unable to start the task.",
            );

            setScreen("instructions");
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!trialId) {
            setError("The trial was not started.");
            return;
        }

        setError("");
        setScreen("submitting");

        const accuracy = calculateAccuracy(
            form,
            scenario,
        );

        try {
            await completeTrial({
                trialId,
                accuracy,
                completionDevice: selectedDevice,
            });

            setScreen("complete");
        } catch (caughtError) {
            console.error(
                "Unable to complete password trial:",
                caughtError,
            );

            setError(
                caughtError.message ||
                "Unable to submit the task.",
            );

            setScreen("password-form");
        }
    }

    function handleContinue() {
        const hasNextMobileCondition =
            isMobile &&
            conditionIndex < MOBILE_CONDITIONS.length - 1;

        if (hasNextMobileCondition) {
            const nextConditionIndex = conditionIndex + 1;

            sessionStorage.setItem(
                "conditionIndex",
                String(nextConditionIndex),
            );

            setStudySession((currentSession) => ({
                ...currentSession,
                conditionIndex: nextConditionIndex,
            }));

            setTrialId(null);
            setForm({ ...EMPTY_FORM });
            setVisiblePasswords({ ...HIDDEN_PASSWORDS });
            setError("");
            setScreen("instructions");

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        sessionStorage.removeItem("conditionIndex");
        router.push("/");
    }

    function renderPasswordField({
                                     label,
                                     name,
                                 }) {
        const isVisible = visiblePasswords[name];

        return (
            <label>
                <span>{label}</span>

                <div className={styles.passwordInputRow}>
                    <input
                        type={isVisible ? "text" : "password"}
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                    />

                    <button
                        type="button"
                        className={styles.fieldToggleButton}
                        onClick={() =>
                            togglePasswordVisibility(name)
                        }
                        aria-pressed={isVisible}
                        aria-label={
                            isVisible
                                ? `Hide ${label.toLowerCase()}`
                                : `Show ${label.toLowerCase()}`
                        }
                    >
                        {isVisible ? "Hide" : "Show"}
                    </button>
                </div>
            </label>
        );
    }

    function renderCurrentPasswordSection() {
        return (
            <section className={styles.formSection}>
                <h2>Current Password</h2>

                {renderPasswordField({
                    label: "Current password",
                    name: "currentPassword",
                })}
            </section>
        );
    }

    function renderNewPasswordSection() {
        return (
            <section className={styles.formSection}>
                <h2>New Password</h2>

                {renderPasswordField({
                    label: "New password",
                    name: "newPassword",
                })}

                {renderPasswordField({
                    label: "Confirm new password",
                    name: "confirmPassword",
                })}
            </section>
        );
    }

    if (
        screen === "instructions" ||
        screen === "starting"
    ) {
        return (
            <main
                className={`${styles.page} ${
                    isLPC
                        ? styles.lowPerceptual
                        : styles.highPerceptual
                }`}
            >
                <section className={styles.card}>
                    <p className={styles.studyLabel}>
                        {isMobile
                            ? `Task 2 · Round ${conditionIndex + 1} of 4`
                            : "Task 2 · Reference"}
                    </p>

                    <h1>Change Password Task</h1>

                    <p className={styles.description}>
                        Use the study passwords below to update the
                        account password.
                    </p>

                    <div className={styles.instructions}>
                        <dl className={styles.taskDetails}>
                            <div>
                                <dt>Account</dt>
                                <dd>{scenario.accountName}</dd>
                            </div>

                            <div>
                                <dt>Current password</dt>
                                <dd>{scenario.currentPassword}</dd>
                            </div>

                            <div>
                                <dt>New password</dt>
                                <dd>{scenario.newPassword}</dd>
                            </div>
                        </dl>
                    </div>

                    <p className={styles.notice}>
                        Use only the fictional passwords shown above.
                        Do not enter a real password. The timer starts
                        when you select Begin Task.
                    </p>

                    {error && (
                        <p className={styles.error}>{error}</p>
                    )}

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleBeginTask}
                        disabled={screen === "starting"}
                    >
                        {screen === "starting"
                            ? "Starting..."
                            : "Begin Task"}
                    </button>
                </section>
            </main>
        );
    }

    if (screen === "complete") {
        const hasNextMobileCondition =
            isMobile &&
            conditionIndex < MOBILE_CONDITIONS.length - 1;

        return (
            <main
                className={`${styles.page} ${
                    isLPC
                        ? styles.lowPerceptual
                        : styles.highPerceptual
                }`}
            >
                <section className={styles.card}>
                    <h1>
                        {hasNextMobileCondition
                            ? "Round Completed"
                            : "Task 2 Completed"}
                    </h1>

                    <p className={styles.description}>
                        Your response has been recorded.
                    </p>

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleContinue}
                    >
                        {hasNextMobileCondition
                            ? "Continue"
                            : "Return to Homepage"}
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main
            className={`${styles.page} ${
                isLPC
                    ? styles.lowPerceptual
                    : styles.highPerceptual
            }`}
        >
            <div className={styles.passwordLayout}>
                <section className={styles.passwordCard}>
                    <header className={styles.passwordHeader}>
                        <p className={styles.studyLabel}>
                            {isMobile
                                ? `Task 2 · Round ${conditionIndex + 1} of 4`
                                : "Task 2 · Reference"}
                        </p>

                        <h1>Change Password</h1>
                    </header>

                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                    >
                        {isLOC ? (
                            <>
                                {renderNewPasswordSection()}
                                {renderCurrentPasswordSection()}
                            </>
                        ) : (
                            <>
                                {renderCurrentPasswordSection()}
                                {renderNewPasswordSection()}
                            </>
                        )}

                        {error && (
                            <p className={styles.error}>{error}</p>
                        )}

                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={screen === "submitting"}
                        >
                            {screen === "submitting"
                                ? "Updating Password..."
                                : "Update Password"}
                        </button>
                    </form>
                </section>

                <aside className={styles.summaryCard}>
                    <h2>Password Details</h2>

                    <dl className={styles.summaryDetails}>
                        <div>
                            <dt>Account</dt>
                            <dd>{scenario.accountName}</dd>
                        </div>

                        <div>
                            <dt>Current</dt>
                            <dd>{scenario.currentPassword}</dd>
                        </div>

                        <div>
                            <dt>New</dt>
                            <dd>{scenario.newPassword}</dd>
                        </div>
                    </dl>

                    <p className={styles.summaryNotice}>
                        These are fictional study passwords. No real
                        account will be changed.
                    </p>
                </aside>
            </div>
        </main>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { completeTrial, startTrial } from "@/lib/api";
import {
    MOBILE_CONDITIONS,
    getMobileCondition,
    getTaskScenario,
} from "@/config/tasks";

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

function getPasswordRequirements(password) {
    return [
        {
            label: "At least 8 characters",
            met: password.length >= 8,
        },
        {
            label: "One uppercase letter",
            met: /[A-Z]/.test(password),
        },
        {
            label: "One lowercase letter",
            met: /[a-z]/.test(password),
        },
        {
            label: "One number",
            met: /\d/.test(password),
        },
        {
            label: "One symbol",
            met: /[^A-Za-z0-9]/.test(password),
        },
    ];
}

function Icon({ name, className }) {
    if (name === "lock") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (name === "key") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle
                    cx="8"
                    cy="12"
                    r="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="M12 12h8M17 12v3M20 12v2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (name === "shield") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M12 3 19 6v5c0 4.4-2.8 8-7 10-4.2-2-7-5.6-7-10V6l7-3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <path
                    d="m9 12 2 2 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (name === "eye") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <circle
                    cx="12"
                    cy="12"
                    r="2.3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </svg>
        );
    }

    if (name === "check") {
        return (
            <svg
                className={className}
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path
                    d="m4.5 10 3.2 3.2 7.8-7.7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (name === "x") {
        return (
            <svg
                className={className}
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path
                    d="m6 6 8 8M14 6l-8 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    return null;
}

function SectionCue({ kind }) {
    const highMapping = {
        current: ["key", "cueBlue"],
        new: ["shield", "cueGreen"],
    };

    const [iconName, colorClass] = highMapping[kind];

    return (
        <span
            className={`${styles.sectionCue} ${styles[colorClass]}`}
            aria-hidden="true"
        >
            <Icon name={iconName} />
        </span>
    );
}

export default function ChangePasswordPage() {
    const router = useRouter();

    const [studySession, setStudySession] =
        useState(null);

    const [trialId, setTrialId] =
        useState(null);

    const [form, setForm] =
        useState({ ...EMPTY_FORM });

    const [visiblePasswords, setVisiblePasswords] =
        useState({ ...HIDDEN_PASSWORDS });

    const [screen, setScreen] =
        useState("instructions");

    const [error, setError] =
        useState("");

    const [isMobileMenuOpen, setIsMobileMenuOpen] =
        useState(false);

    useEffect(() => {
        const participantId =
            sessionStorage.getItem("participantId");

        const selectedDevice =
            sessionStorage.getItem("selectedDevice");

        const selectedTask =
            sessionStorage.getItem("selectedTask");

        const selectedRound =
            sessionStorage.getItem("selectedRound") || "";

        const storedCondition =
            sessionStorage.getItem("condition") || "";

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
            conditionIndex < 0 ||
            conditionIndex >= MOBILE_CONDITIONS.length
        ) {
            conditionIndex = 0;
        }

        setStudySession({
            participantId,
            selectedDevice,
            selectedRound,
            storedCondition,
            conditionIndex,
        });
    }, [router]);

    if (!studySession) {
        return (
            <main className={styles.page}>
                <section className={styles.studyCard}>
                    <p>Loading task...</p>
                </section>
            </main>
        );
    }

    const {
        participantId,
        selectedDevice,
        selectedRound,
        storedCondition,
        conditionIndex,
    } = studySession;

    const isMobile =
        selectedDevice === "mobile";

    const condition =
        storedCondition ||
        getMobileCondition(conditionIndex);

    const isLOC =
        condition.endsWith("LOC");

    const scenario = getTaskScenario(
        "task2",
        selectedDevice,
        conditionIndex,
    );

    if (!scenario) {
        return (
            <main className={styles.page}>
                <section className={styles.studyCard}>
                    <p>Task scenario not found.</p>
                </section>
            </main>
        );
    }

    const roundNumber =
        Number(selectedRound) ||
        (isMobile
            ? conditionIndex + 3
            : conditionIndex + 1);

    const trialOrder =
        roundNumber + 4;

    const roundLabel =
        `Task 2 · Round ${roundNumber} of 4`;

    const pageClassName =
        `${styles.page} ${styles.highPerceptual}`;

    const passwordRequirements =
        getPasswordRequirements(form.newPassword);

    const showRequirements =
        form.newPassword.length > 0;

    const showConfirmationStatus =
        form.confirmPassword.length > 0;

    const passwordsMatch =
        form.newPassword.length > 0 &&
        form.confirmPassword === form.newPassword;

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

    function toggleMobileMenu() {
        setIsMobileMenuOpen(
            (currentValue) => !currentValue,
        );
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
        setIsMobileMenuOpen(false);

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
        sessionStorage.removeItem("activeTrialId");
        router.push("/");
    }

    function renderPasswordInput({
                                     label,
                                     name,
                                     autoComplete,
                                 }) {
        const isVisible = visiblePasswords[name];

        return (
            <label className={styles.field}>
                <span>{label}</span>

                <div className={styles.passwordInputRow}>
                    <input
                        type={isVisible ? "text" : "password"}
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        autoComplete={autoComplete}
                        required
                    />

                    <button
                        type="button"
                        className={styles.showButton}
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
                        <Icon
                            name="eye"
                            className={styles.showIcon}
                        />

                        <span>
                            {isVisible ? "Hide" : "Show"}
                        </span>
                    </button>
                </div>
            </label>
        );
    }

    function renderCurrentPasswordSection() {
        return (
            <section className={styles.formSection}>
                <div className={styles.sectionHeading}>
                    <SectionCue kind="current" />

                    <div>
                        <h2>Current password</h2>

                        <p>
                            Confirm your existing password before making
                            this change.
                        </p>
                    </div>
                </div>

                {renderPasswordInput({
                    label: "Current password",
                    name: "currentPassword",
                    autoComplete: "current-password",
                })}
            </section>
        );
    }

    function renderNewPasswordSection() {
        return (
            <section className={styles.formSection}>
                <div className={styles.sectionHeading}>
                    <SectionCue kind="new" />

                    <div>
                        <h2>New password</h2>

                        <p>
                            Enter the new password and confirm it below.
                        </p>
                    </div>
                </div>

                <div className={styles.newPasswordFields}>
                    <div>
                        {renderPasswordInput({
                            label: "New password",
                            name: "newPassword",
                            autoComplete: "new-password",
                        })}

                        {showRequirements && (
                            <div
                                className={styles.passwordRequirements}
                                aria-live="polite"
                            >
                                <p>Password requirements</p>

                                <ul>
                                    {passwordRequirements.map(
                                        (requirement) => (
                                            <li
                                                key={requirement.label}
                                                className={
                                                    requirement.met
                                                        ? styles.requirementMet
                                                        : styles.requirementPending
                                                }
                                            >
                                                <Icon
                                                    name={
                                                        requirement.met
                                                            ? "check"
                                                            : "x"
                                                    }
                                                />

                                                <span>
                                                    {requirement.label}
                                                </span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div>
                        {renderPasswordInput({
                            label: "Confirm new password",
                            name: "confirmPassword",
                            autoComplete: "new-password",
                        })}

                        {showConfirmationStatus && (
                            <p
                                className={
                                    passwordsMatch
                                        ? styles.matchMessage
                                        : styles.mismatchMessage
                                }
                                aria-live="polite"
                            >
                                <Icon
                                    name={
                                        passwordsMatch
                                            ? "check"
                                            : "x"
                                    }
                                />

                                <span>
                                    {passwordsMatch
                                        ? "Passwords match"
                                        : "Passwords do not match"}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    if (
        screen === "instructions" ||
        screen === "starting"
    ) {
        return (
            <main className={pageClassName}>
                <section className={styles.studyCard}>
                    <p className={styles.studyLabel}>
                        {roundLabel}
                    </p>

                    <h1>Change password task</h1>

                    <p className={styles.description}>
                        Update the study account password using the
                        information provided to you. The required
                        passwords will not be displayed in this
                        application.
                    </p>

                    <div className={styles.notice}>
                        <Icon name="lock" />

                        <p>
                            Use only the fictional study passwords. The
                            timer starts when you select Begin Task.
                        </p>
                    </div>

                    {error && (
                        <p
                            className={styles.error}
                            role="alert"
                        >
                            {error}
                        </p>
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
        return (
            <main className={pageClassName}>
                <section className={styles.studyCard}>
                    <div className={styles.successIcon}>
                        <Icon name="check" />
                    </div>

                    <h1>Task 2 completed</h1>

                    <p className={styles.description}>
                        Your response has been recorded.
                    </p>

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleContinue}
                    >
                        Return to Homepage
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className={pageClassName}>
            <header className={styles.appHeader}>
                <div className={styles.brand}>
                    <span className={styles.brandIcon}>
                        <Icon name="lock" />
                    </span>

                    <div>
                        <strong>Account settings</strong>
                        <span>Manage your account</span>
                    </div>
                </div>

                <div className={styles.headerActions}>
                    <span className={styles.secureStatus}>
                        Secure session
                    </span>

                    <button
                        type="button"
                        className={`${styles.menuButton} ${
                            isMobileMenuOpen
                                ? styles.menuButtonOpen
                                : ""
                        }`}
                        onClick={toggleMobileMenu}
                        aria-expanded={isMobileMenuOpen}
                        aria-label={
                            isMobileMenuOpen
                                ? "Close settings menu"
                                : "Open settings menu"
                        }
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </header>

            <nav
                className={`${styles.mobileMenu} ${
                    isMobileMenuOpen
                        ? styles.mobileMenuOpen
                        : ""
                }`}
                aria-label="Mobile account settings"
                aria-hidden={!isMobileMenuOpen}
            >
                <span>Profile</span>

                <span className={styles.mobileMenuActive}>
                    Security
                </span>

                <span>Notifications</span>

                <span>Privacy</span>
            </nav>

            <div className={styles.settingsLayout}>
                <nav
                    className={styles.settingsNavigation}
                    aria-label="Account settings"
                >
                    <p>Settings</p>

                    <span>Profile</span>

                    <span className={styles.activeNavigationItem}>
                        Security
                    </span>

                    <span>Notifications</span>

                    <span>Privacy</span>
                </nav>

                <section className={styles.settingsContent}>
                    <header className={styles.pageHeader}>
                        <p className={styles.studyLabel}>
                            {roundLabel}
                        </p>

                        <h1>Password and security</h1>

                        <p>
                            Update the password associated with this
                            account.
                        </p>
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
                            <p
                                className={styles.error}
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        <div className={styles.formActions}>
                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={screen === "submitting"}
                            >
                                {screen === "submitting"
                                    ? "Updating password..."
                                    : "Update password"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
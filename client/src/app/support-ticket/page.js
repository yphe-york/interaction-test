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
    category: "",
    subject: "",
    description: "",
    priority: "",
};

const HOC_ORDER = [
    "category",
    "subject",
    "description",
    "priority",
];

const LOC_ORDER = [
    "priority",
    "description",
    "category",
    "subject",
];

function normalizeText(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[.!?]+$/g, "")
        .replace(/\s+/g, " ");
}

function calculateAccuracy(form, scenario) {
    const correctCategory =
        form.category === scenario.category;

    const correctSubject =
        normalizeText(form.subject) ===
        normalizeText(scenario.subject);

    const correctDescription =
        normalizeText(form.description) ===
        normalizeText(scenario.description);

    const correctPriority =
        form.priority === scenario.priority;

    return correctCategory &&
    correctSubject &&
    correctDescription &&
    correctPriority
        ? 1
        : 0;
}

function Icon({ name, className }) {
    if (name === "headset") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M4 13v-2a8 8 0 0 1 16 0v2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />

                <rect
                    x="3"
                    y="12"
                    width="4"
                    height="7"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <rect
                    x="17"
                    y="12"
                    width="4"
                    height="7"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="M17 19c0 1.1-.9 2-2 2h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (name === "grid") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <rect
                    x="4"
                    y="4"
                    width="6"
                    height="6"
                    rx="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <rect
                    x="14"
                    y="4"
                    width="6"
                    height="6"
                    rx="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <rect
                    x="4"
                    y="14"
                    width="6"
                    height="6"
                    rx="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <rect
                    x="14"
                    y="14"
                    width="6"
                    height="6"
                    rx="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </svg>
        );
    }

    if (name === "tag") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M4 5h7l9 9-6 6-9-9V5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <circle cx="8.5" cy="8.5" r="1.3" />
            </svg>
        );
    }

    if (name === "document") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M6 3h8l4 4v14H6V3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <path
                    d="M14 3v5h4M9 12h6M9 16h6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (name === "flag") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M6 21V4M6 5h11l-2 4 2 4H6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (name === "bell") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M6 17h12l-1.5-2.5V10a4.5 4.5 0 0 0-9 0v4.5L6 17Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <path
                    d="M10 20h4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (name === "compass") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (name === "chat") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M4 5h16v12H9l-5 4V5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <path
                    d="M8 9h8M8 13h5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (name === "star") {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
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

    return null;
}

function SectionCue({ kind, isLPC }) {
    const highMapping = {
        category: ["grid", "cueBlue"],
        subject: ["tag", "cuePurple"],
        description: ["document", "cueGreen"],
        priority: ["flag", "cueOrange"],
    };

    const lowMapping = {
        category: ["bell", "cuePurple"],
        subject: ["compass", "cueOrange"],
        description: ["chat", "cueBlue"],
        priority: ["star", "cueGreen"],
    };

    const mapping = isLPC
        ? lowMapping
        : highMapping;

    const [iconName, colorClass] = mapping[kind];

    return (
        <span
            className={`${styles.sectionCue} ${styles[colorClass]}`}
            aria-hidden="true"
        >
      <Icon name={iconName} />
    </span>
    );
}

export default function SupportTicketPage() {
    const router = useRouter();

    const [studySession, setStudySession] =
        useState(null);

    const [trialId, setTrialId] =
        useState(null);

    const [form, setForm] =
        useState({ ...EMPTY_FORM });

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

        if (
            !participantId ||
            !selectedDevice ||
            selectedTask !== "task3"
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
                <section className={styles.studyCard}>
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

    const isMobile =
        selectedDevice === "mobile";

    const condition = isMobile
        ? getMobileCondition(conditionIndex)
        : "HPC-HOC";

    const isLOC =
        isMobile && condition.endsWith("LOC");

    const isLPC =
        isMobile && condition.startsWith("LPC");

    const scenario = getTaskScenario(
        "task3",
        selectedDevice,
        conditionIndex,
    );

    const trialOrder = isMobile
        ? conditionIndex + 12
        : 11;

    const formSectionOrder = isLOC
        ? LOC_ORDER
        : HOC_ORDER;

    const pageClassName = `${styles.page} ${
        isLPC
            ? styles.lowPerceptual
            : styles.highPerceptual
    }`;

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));

        setError("");
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
                taskName: "support-ticket",
                trialOrder,
                startDevice: selectedDevice,
            });

            setTrialId(result.trial.id);
            setScreen("ticket-form");
        } catch (caughtError) {
            console.error(
                "Unable to start support-ticket trial:",
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
                "Unable to complete support-ticket trial:",
                caughtError,
            );

            setError(
                caughtError.message ||
                "Unable to submit the task.",
            );

            setScreen("ticket-form");
        }
    }

    function handleContinue() {
        const hasNextMobileCondition =
            isMobile &&
            conditionIndex < MOBILE_CONDITIONS.length - 1;

        if (hasNextMobileCondition) {
            const nextConditionIndex =
                conditionIndex + 1;

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
            setIsMobileMenuOpen(false);
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

    function renderCategorySection() {
        return (
            <section
                className={styles.formSection}
                key="category"
            >
                <div className={styles.sectionHeading}>
                    <SectionCue
                        kind="category"
                        isLPC={isLPC}
                    />

                    <div>
                        <h2>Category</h2>

                        <p>
                            Select the area that best matches the request.
                        </p>
                    </div>
                </div>

                <label className={styles.field}>
                    <span>Ticket category</span>

                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select a category
                        </option>

                        <option value="billing">
                            Billing
                        </option>

                        <option value="technical">
                            Technical Support
                        </option>

                        <option value="shipping">
                            Shipping
                        </option>

                        <option value="account">
                            Account
                        </option>

                        <option value="product">
                            Product
                        </option>
                    </select>
                </label>
            </section>
        );
    }

    function renderSubjectSection() {
        return (
            <section
                className={styles.formSection}
                key="subject"
            >
                <div className={styles.sectionHeading}>
                    <SectionCue
                        kind="subject"
                        isLPC={isLPC}
                    />

                    <div>
                        <h2>Subject</h2>

                        <p>
                            Enter a short title describing the request.
                        </p>
                    </div>
                </div>

                <label className={styles.field}>
                    <span>Ticket subject</span>

                    <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                    />
                </label>
            </section>
        );
    }

    function renderDescriptionSection() {
        return (
            <section
                className={styles.formSection}
                key="description"
            >
                <div className={styles.sectionHeading}>
                    <SectionCue
                        kind="description"
                        isLPC={isLPC}
                    />

                    <div>
                        <h2>Description</h2>

                        <p>
                            Provide the details needed to understand the
                            issue.
                        </p>
                    </div>
                </div>

                <label className={styles.field}>
                    <span>Describe the issue</span>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={6}
                        required
                    />

                    <span className={styles.characterCount}>
            {form.description.length} characters
          </span>
                </label>
            </section>
        );
    }

    function renderPrioritySection() {
        return (
            <section
                className={styles.formSection}
                key="priority"
            >
                <div className={styles.sectionHeading}>
                    <SectionCue
                        kind="priority"
                        isLPC={isLPC}
                    />

                    <div>
                        <h2>Priority</h2>

                        <p>
                            Select the urgency level for this request.
                        </p>
                    </div>
                </div>

                <label className={styles.field}>
                    <span>Ticket priority</span>

                    <select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select a priority
                        </option>

                        <option value="low">
                            Low
                        </option>

                        <option value="medium">
                            Medium
                        </option>

                        <option value="high">
                            High
                        </option>
                    </select>
                </label>
            </section>
        );
    }

    function renderFormSection(sectionName) {
        const sections = {
            category: renderCategorySection,
            subject: renderSubjectSection,
            description: renderDescriptionSection,
            priority: renderPrioritySection,
        };

        return sections[sectionName]();
    }

    if (
        screen === "instructions" ||
        screen === "starting"
    ) {
        return (
            <main className={pageClassName}>
                <section className={styles.studyCard}>
                    <p className={styles.studyLabel}>
                        {isMobile
                            ? `Task 3 · Round ${conditionIndex + 1} of 4`
                            : "Task 3 · Reference"}
                    </p>

                    <h1>Submit a support ticket</h1>

                    <p className={styles.description}>
                        Create a support request using the task
                        information provided to you. The required ticket
                        details will not be displayed in this application.
                    </p>

                    <div className={styles.notice}>
                        <Icon name="headset" />

                        <p>
                            This is a simulated support portal. Do not enter
                            real personal information. The timer starts when
                            you select Begin Task.
                        </p>
                    </div>

                    {error && (
                        <p className={styles.error} role="alert">
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
        const hasNextMobileCondition =
            isMobile &&
            conditionIndex < MOBILE_CONDITIONS.length - 1;

        return (
            <main className={pageClassName}>
                <section className={styles.studyCard}>
                    <div className={styles.successIcon}>
                        <Icon name="check" />
                    </div>

                    <h1>
                        {hasNextMobileCondition
                            ? "Round completed"
                            : "Task 3 completed"}
                    </h1>

                    <p className={styles.description}>
                        Your support request has been recorded.
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
        <main className={pageClassName}>
            <header className={styles.appHeader}>
                <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <Icon name="headset" />
          </span>

                    <div>
                        <strong>Support center</strong>
                        <span>Customer help portal</span>
                    </div>
                </div>

                <div className={styles.headerActions}>
          <span className={styles.supportStatus}>
            Support online
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
                                ? "Close support menu"
                                : "Open support menu"
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
                aria-label="Mobile support navigation"
                aria-hidden={!isMobileMenuOpen}
            >
                <span>Help center</span>
                <span>My tickets</span>

                <span className={styles.mobileMenuActive}>
          New request
        </span>

                <span>Contact support</span>
            </nav>

            <div className={styles.supportLayout}>
                <nav
                    className={styles.supportNavigation}
                    aria-label="Support navigation"
                >
                    <p>Support</p>

                    <span>Help center</span>
                    <span>My tickets</span>

                    <span className={styles.activeNavigationItem}>
            New request
          </span>

                    <span>Contact support</span>
                </nav>

                <section className={styles.supportContent}>
                    <header className={styles.pageHeader}>
                        <p className={styles.studyLabel}>
                            {isMobile
                                ? `Task 3 · Round ${conditionIndex + 1} of 4`
                                : "Task 3 · Reference"}
                        </p>

                        <h1>Create a support request</h1>

                        <p>
                            Complete the form below and submit the request
                            to the support team.
                        </p>
                    </header>

                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                    >
                        {formSectionOrder.map(renderFormSection)}

                        {error && (
                            <p className={styles.error} role="alert">
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
                                    ? "Submitting ticket..."
                                    : "Submit ticket"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}

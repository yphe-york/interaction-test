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

const TICKET_SCENARIOS = [
    {
        category: "billing",
        categoryLabel: "Billing",
        subject: "Duplicate charge",
        description: "I was charged twice for order 1042.",
        priority: "high",
        priorityLabel: "High",
    },
    {
        category: "technical",
        categoryLabel: "Technical Support",
        subject: "App login issue",
        description:
            "The app shows an error after I enter my password.",
        priority: "medium",
        priorityLabel: "Medium",
    },
    {
        category: "shipping",
        categoryLabel: "Shipping",
        subject: "Delivery status",
        description:
            "My order 2085 has not updated for three days.",
        priority: "medium",
        priorityLabel: "Medium",
    },
    {
        category: "account",
        categoryLabel: "Account",
        subject: "Email update",
        description:
            "I cannot change the email address on my account.",
        priority: "low",
        priorityLabel: "Low",
    },
    {
        category: "product",
        categoryLabel: "Product",
        subject: "Damaged item",
        description:
            "The desk lamp arrived with a cracked base.",
        priority: "high",
        priorityLabel: "High",
    },
];

const EMPTY_FORM = {
    category: "",
    subject: "",
    description: "",
    priority: "",
};

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

export default function SupportTicketPage() {
    const router = useRouter();

    const [studySession, setStudySession] = useState(null);
    const [trialId, setTrialId] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
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
        TICKET_SCENARIOS[scenarioIndex] ||
        TICKET_SCENARIOS[0];

    const trialOrder = isMobile
        ? conditionIndex + 12
        : 11;

    const sectionOrder = isLOC
        ? ["priority", "description", "category", "subject"]
        : ["category", "subject", "description", "priority"];

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));

        setError("");
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
                <h2>Category</h2>

                <label>
                    <span>Ticket category</span>

                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="billing">Billing</option>
                        <option value="technical">
                            Technical Support
                        </option>
                        <option value="shipping">Shipping</option>
                        <option value="account">Account</option>
                        <option value="product">Product</option>
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
                <h2>Subject</h2>

                <label>
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
                <h2>Description</h2>

                <label>
                    <span>Describe the issue</span>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={5}
                        required
                    />
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
                <h2>Priority</h2>

                <label>
                    <span>Ticket priority</span>

                    <select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
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

    function renderInstructionDetail(sectionName) {
        const details = {
            category: {
                label: "Category",
                value: scenario.categoryLabel,
            },
            subject: {
                label: "Subject",
                value: scenario.subject,
            },
            description: {
                label: "Description",
                value: scenario.description,
            },
            priority: {
                label: "Priority",
                value: scenario.priorityLabel,
            },
        };

        const detail = details[sectionName];

        return (
            <div key={sectionName}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
            </div>
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
                            ? `Task 3 · Round ${conditionIndex + 1} of 4`
                            : "Task 3 · Reference"}
                    </p>

                    <h1>Submit a Support Ticket</h1>

                    <p className={styles.description}>
                        Use the information below to create a support
                        ticket.
                    </p>

                    <div className={styles.instructions}>
                        <dl className={styles.taskDetails}>
                            {sectionOrder.map(renderInstructionDetail)}
                        </dl>
                    </div>

                    <p className={styles.notice}>
                        This is a simulated support form. Do not enter
                        real personal information. The timer starts when
                        you select Begin Task.
                    </p>

                    {error && (
                        <p className={styles.error}>
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
                            : "Task 3 Completed"}
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
            <div className={styles.ticketLayout}>
                <section className={styles.ticketCard}>
                    <header className={styles.ticketHeader}>
                        <p className={styles.studyLabel}>
                            {isMobile
                                ? `Task 3 · Round ${conditionIndex + 1} of 4`
                                : "Task 3 · Reference"}
                        </p>

                        <h1>Submit Support Ticket</h1>
                    </header>

                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                    >
                        {sectionOrder.map(renderFormSection)}

                        {error && (
                            <p className={styles.error}>
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={screen === "submitting"}
                        >
                            {screen === "submitting"
                                ? "Submitting Ticket..."
                                : "Submit Ticket"}
                        </button>
                    </form>
                </section>

                <aside className={styles.summaryCard}>
                    <h2>Ticket Details</h2>

                    <dl className={styles.summaryDetails}>
                        {sectionOrder.map(renderInstructionDetail)}
                    </dl>

                    <p className={styles.summaryNotice}>
                        This is a simulated support request. No real
                        support ticket will be created.
                    </p>
                </aside>
            </div>
        </main>
    );
}
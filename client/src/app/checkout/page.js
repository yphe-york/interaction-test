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
    fullName: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    fullAddress: "",
    shippingMethod: "",
    paymentMethod: "",
};

function normalizeText(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function normalizePostalCode(value) {
    return String(value)
        .replace(/\s/g, "")
        .toUpperCase();
}

function normalizeAddress(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[.,]/g, "")
        .replace(/\s+/g, " ");
}

function getFullAddress(scenario) {
    return `${scenario.streetAddress}, ${scenario.city}, ${scenario.postalCode}`;
}

function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
}

function getShippingCost(shippingMethod) {
    if (shippingMethod === "express") {
        return 14.99;
    }

    if (shippingMethod === "standard") {
        return 0;
    }

    return null;
}

function getShippingLabel(shippingMethod) {
    if (shippingMethod === "express") {
        return "Express shipping";
    }

    if (shippingMethod === "standard") {
        return "Standard shipping";
    }

    return "Not selected";
}

function getPaymentLabel(paymentMethod) {
    if (paymentMethod === "study-card") {
        return "Study Card";
    }

    if (paymentMethod === "paypal") {
        return "PayPal";
    }

    return "Not selected";
}

function calculateAccuracy(form, scenario, isLOC) {
    const correctName =
        normalizeText(form.fullName) ===
        normalizeText(scenario.fullName);

    const correctShipping =
        form.shippingMethod === scenario.shippingMethod;

    const correctPayment =
        form.paymentMethod === scenario.paymentMethod;

    let correctAddress = false;

    if (isLOC) {
        correctAddress =
            normalizeAddress(form.fullAddress) ===
            normalizeAddress(getFullAddress(scenario));
    } else {
        correctAddress =
            normalizeText(form.streetAddress) ===
            normalizeText(scenario.streetAddress) &&
            normalizeText(form.city) ===
            normalizeText(scenario.city) &&
            normalizePostalCode(form.postalCode) ===
            normalizePostalCode(scenario.postalCode);
    }

    return correctName &&
    correctAddress &&
    correctShipping &&
    correctPayment
        ? 1
        : 0;
}

function CueSvg({ name }) {
    if (name === "user") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="M5.5 20c.6-4.1 3-6.2 6.5-6.2s5.9 2.1 6.5 6.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (name === "pin") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="M12 21s6-5.6 6-11A6 6 0 0 0 6 10c0 5.4 6 11 6 11Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <circle
                    cx="12"
                    cy="10"
                    r="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </svg>
        );
    }

    if (name === "truck") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="M3 6h11v10H3V6Zm11 4h3l3 3v3h-6v-6Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <circle cx="7" cy="18" r="1.7" />
                <circle cx="17" cy="18" r="1.7" />
            </svg>
        );
    }

    if (name === "card") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="M3 9h18M7 15h4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (name === "tag") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
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

    if (name === "compass") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
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

    if (name === "package") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="m4 7 8-4 8 4v10l-8 4-8-4V7Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <path
                    d="m4 7 8 4 8-4M12 11v10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </svg>
        );
    }

    if (name === "shield") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
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

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="m4 7 8-4 8 4v10l-8 4-8-4V7Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />

            <path
                d="m4 7 8 4 8-4M12 11v10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function SectionCue({ kind, isLPC }) {
    const highMapping = {
        customer: ["user", "cueBlue"],
        address: ["pin", "cuePurple"],
        delivery: ["truck", "cueGreen"],
        payment: ["card", "cueOrange"],
    };

    const lowMapping = {
        customer: ["tag", "cuePurple"],
        address: ["compass", "cueOrange"],
        delivery: ["package", "cueBlue"],
        payment: ["shield", "cueGreen"],
    };

    const mapping = isLPC
        ? lowMapping
        : highMapping;

    const [iconName, colorClass] = mapping[kind];

    return (
        <span
            className={`${styles.cue} ${styles[colorClass]}`}
            aria-hidden="true"
        >
      <CueSvg name={iconName} />
    </span>
    );
}

function LockIcon() {
    return (
        <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className={styles.inlineIcon}
        >
            <rect
                x="4.5"
                y="8"
                width="11"
                height="8"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            />

            <path
                d="M7 8V6a3 3 0 0 1 6 0v2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ActionIcon({ isLPC }) {
    return (
        <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className={styles.buttonIcon}
        >
            {isLPC ? (
                <path
                    d="m4.5 10 3.3 3.3 7.7-7.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ) : (
                <path
                    d="M4 10h11M11 6l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}
        </svg>
    );
}

export default function CheckoutPage() {
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
            selectedTask !== "task1"
        ) {
            router.replace("/");
            return;
        }

        let conditionIndex = Number(
            sessionStorage.getItem(
                "conditionIndex",
            ) || "0",
        );

        if (
            selectedDevice !== "mobile" ||
            conditionIndex < 0 ||
            conditionIndex >=
            MOBILE_CONDITIONS.length
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
        isMobile &&
        condition.endsWith("LOC");

    const isLPC =
        isMobile &&
        condition.startsWith("LPC");

    const scenario = getTaskScenario(
        "task1",
        selectedDevice,
        conditionIndex,
    );

    const trialOrder = isMobile
        ? conditionIndex + 2
        : 1;

    const shippingCost =
        getShippingCost(form.shippingMethod);

    const orderTotal =
        scenario.price + (shippingCost ?? 0);

    const enteredAddress = isLOC
        ? form.fullAddress
        : [
            form.streetAddress,
            form.city,
            form.postalCode,
        ]
            .filter(Boolean)
            .join(", ");

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

    async function handleBeginTask() {
        setError("");
        setScreen("starting");

        try {
            const result = await startTrial({
                participantId,
                condition,
                taskName: "checkout",
                trialOrder,
                startDevice: selectedDevice,
            });

            setTrialId(result.trial.id);
            setScreen("checkout");
        } catch (caughtError) {
            console.error(
                "Unable to start checkout trial:",
                caughtError,
            );

            setError(
                caughtError.message ||
                "Unable to start the task.",
            );

            setScreen("instructions");
        }
    }

    function handleReview(event) {
        event.preventDefault();

        setError("");
        setScreen("review");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function handleEditInformation() {
        setError("");
        setScreen("checkout");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handlePlaceOrder() {
        if (!trialId) {
            setError(
                "The trial was not started.",
            );
            return;
        }

        setError("");
        setScreen("submitting");

        const accuracy = calculateAccuracy(
            form,
            scenario,
            isLOC,
        );

        try {
            await completeTrial({
                trialId,
                accuracy,
                completionDevice:
                selectedDevice,
            });

            setScreen("complete");
        } catch (caughtError) {
            console.error(
                "Unable to complete checkout trial:",
                caughtError,
            );

            setError(
                caughtError.message ||
                "Unable to place the order.",
            );

            setScreen("review");
        }
    }

    function handleContinue() {
        const hasNextMobileCondition =
            isMobile &&
            conditionIndex <
            MOBILE_CONDITIONS.length - 1;

        if (hasNextMobileCondition) {
            const nextConditionIndex =
                conditionIndex + 1;

            sessionStorage.setItem(
                "conditionIndex",
                String(nextConditionIndex),
            );

            setStudySession(
                (currentSession) => ({
                    ...currentSession,
                    conditionIndex:
                    nextConditionIndex,
                }),
            );

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

        sessionStorage.removeItem(
            "conditionIndex",
        );

        router.push("/");
    }

    function renderNameSection() {
        return (
            <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                    <SectionCue
                        kind="customer"
                        isLPC={isLPC}
                    />

                    <span>
            Customer information
          </span>
                </h2>

                <label>
                    <span>Full name</span>

                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                    />
                </label>
            </section>
        );
    }

    function renderSeparateAddressSection() {
        return (
            <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                    <SectionCue
                        kind="address"
                        isLPC={isLPC}
                    />

                    <span>Shipping address</span>
                </h2>

                <div className={styles.fieldGrid}>
                    <label className={styles.fullWidth}>
                        <span>Street address</span>

                        <input
                            type="text"
                            name="streetAddress"
                            value={form.streetAddress}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />
                    </label>

                    <label>
                        <span>City</span>

                        <input
                            type="text"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />
                    </label>

                    <label>
                        <span>Postal code</span>

                        <input
                            type="text"
                            name="postalCode"
                            value={form.postalCode}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />
                    </label>
                </div>
            </section>
        );
    }

    function renderFullAddressSection() {
        return (
            <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                    <SectionCue
                        kind="address"
                        isLPC={isLPC}
                    />

                    <span>Shipping address</span>
                </h2>

                <label>
                    <span>Full address</span>

                    <input
                        type="text"
                        name="fullAddress"
                        value={form.fullAddress}
                        onChange={handleChange}
                        placeholder="Street, city, postal code"
                        autoComplete="off"
                        required
                    />
                </label>
            </section>
        );
    }

    function renderDeliverySection() {
        return (
            <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                    <SectionCue
                        kind="delivery"
                        isLPC={isLPC}
                    />

                    <span>Delivery</span>
                </h2>

                <label>
                    <span>Shipping method</span>

                    <select
                        name="shippingMethod"
                        value={form.shippingMethod}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select a shipping method
                        </option>

                        <option value="standard">
                            Standard shipping
                        </option>

                        <option value="express">
                            Express shipping
                        </option>
                    </select>
                </label>
            </section>
        );
    }

    function renderPaymentSection() {
        return (
            <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                    <SectionCue
                        kind="payment"
                        isLPC={isLPC}
                    />

                    <span>Payment</span>
                </h2>

                <label>
                    <span>Payment method</span>

                    <select
                        name="paymentMethod"
                        value={form.paymentMethod}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select a payment method
                        </option>

                        <option value="study-card">
                            Study Card
                        </option>

                        <option value="paypal">
                            PayPal
                        </option>
                    </select>
                </label>
            </section>
        );
    }

    function renderProductHeader() {
        return (
            <header className={styles.productHeader}>
                <div className={styles.storeIdentity}>
          <span className={styles.storeMark}>
            <CueSvg name="box" />
          </span>

                    <span>Online Store</span>
                </div>

                <div className={styles.secureBadge}>
                    <LockIcon />
                    <span>Secure checkout</span>
                </div>
            </header>
        );
    }

    function renderOrderSummary() {
        return (
            <aside className={styles.summaryPanel}>
                <div className={styles.summaryContent}>
                    <h2>Order summary</h2>

                    <div className={styles.productRow}>
                        <div className={styles.productThumbnail}>
                            <CueSvg name="box" />
                        </div>

                        <div className={styles.productInformation}>
                            <h3>{scenario.product}</h3>
                            <p>Quantity: 1</p>
                        </div>

                        <strong>
                            {formatCurrency(scenario.price)}
                        </strong>
                    </div>

                    <div className={styles.totalSection}>
                        <div>
                            <span>Subtotal</span>

                            <strong>
                                {formatCurrency(scenario.price)}
                            </strong>
                        </div>

                        <div>
                            <span>Shipping</span>

                            <strong>
                                {shippingCost === null
                                    ? "Not selected"
                                    : shippingCost === 0
                                        ? "Free"
                                        : formatCurrency(shippingCost)}
                            </strong>
                        </div>

                        <div className={styles.totalRow}>
                            <span>Total</span>

                            <strong>
                                {formatCurrency(orderTotal)}
                            </strong>
                        </div>
                    </div>

                    <p className={styles.secureNote}>
                        <LockIcon />

                        <span>
            Your checkout information is protected.
          </span>
                    </p>
                </div>
            </aside>
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
                        {isMobile
                            ? `Task 1 · Round ${
                                conditionIndex + 1
                            } of 4`
                            : "Task 1 · Reference"}
                    </p>

                    <h1>Checkout task</h1>

                    <p className={styles.description}>
                        Complete the checkout using the
                        task information provided to you.
                        The required information will not
                        be displayed in this application.
                    </p>

                    <p className={styles.notice}>
                        Make sure the task information is
                        available before continuing. The
                        timer starts when you select Begin
                        Task.
                    </p>

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
            <span>
              {screen === "starting"
                  ? "Starting..."
                  : "Begin Task"}
            </span>

                        {screen !== "starting" && (
                            <ActionIcon isLPC={isLPC} />
                        )}
                    </button>
                </section>
            </main>
        );
    }

    if (screen === "complete") {
        const hasNextMobileCondition =
            isMobile &&
            conditionIndex <
            MOBILE_CONDITIONS.length - 1;

        return (
            <main className={pageClassName}>
                <section className={styles.studyCard}>

                    <div className={styles.successIcon}>
                        <ActionIcon isLPC />
                    </div>

                    <h1>
                        {hasNextMobileCondition
                            ? "Round completed"
                            : "Task 1 completed"}
                    </h1>

                    <p className={styles.description}>
                        Your response has been recorded.
                    </p>

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleContinue}
                    >
            <span>
              {hasNextMobileCondition
                  ? "Continue"
                  : "Return to Homepage"}
            </span>

                        <ActionIcon isLPC={isLPC} />
                    </button>
                </section>
            </main>
        );
    }

    if (
        screen === "review" ||
        screen === "submitting"
    ) {
        return (
            <main className={pageClassName}>
                <div className={styles.checkoutShell}>
                    {renderProductHeader()}

                    <div className={styles.checkoutLayout}>
                        <section
                            className={styles.checkoutCard}
                        >
                            <header
                                className={
                                    styles.checkoutHeader
                                }
                            >
                                <p className={styles.studyLabel}>
                                    Review order
                                </p>

                                <h1>
                                    Confirm your information
                                </h1>

                                <p>
                                    Review the information you
                                    entered before placing the
                                    order.
                                </p>
                            </header>

                            <div
                                className={
                                    styles.reviewSection
                                }
                            >
                                <h2>Customer</h2>

                                <div
                                    className={styles.reviewRow}
                                >
                                    <span>Full name</span>
                                    <strong>
                                        {form.fullName}
                                    </strong>
                                </div>
                            </div>

                            <div
                                className={
                                    styles.reviewSection
                                }
                            >
                                <h2>Shipping address</h2>

                                <div
                                    className={styles.reviewRow}
                                >
                                    <span>Address</span>
                                    <strong>
                                        {enteredAddress}
                                    </strong>
                                </div>
                            </div>

                            <div
                                className={
                                    styles.reviewSection
                                }
                            >
                                <h2>
                                    Delivery and payment
                                </h2>

                                <div
                                    className={styles.reviewRow}
                                >
                  <span>
                    Shipping method
                  </span>

                                    <strong>
                                        {getShippingLabel(
                                            form.shippingMethod,
                                        )}
                                    </strong>
                                </div>

                                <div
                                    className={styles.reviewRow}
                                >
                  <span>
                    Payment method
                  </span>

                                    <strong>
                                        {getPaymentLabel(
                                            form.paymentMethod,
                                        )}
                                    </strong>
                                </div>
                            </div>

                            {error && (
                                <p
                                    className={styles.error}
                                    role="alert"
                                >
                                    {error}
                                </p>
                            )}

                            <div
                                className={
                                    styles.reviewActions
                                }
                            >
                                <button
                                    type="button"
                                    className={
                                        styles.secondaryButton
                                    }
                                    onClick={
                                        handleEditInformation
                                    }
                                    disabled={
                                        screen === "submitting"
                                    }
                                >
                                    Edit information
                                </button>

                                <button
                                    type="button"
                                    className={
                                        styles.primaryButton
                                    }
                                    onClick={handlePlaceOrder}
                                    disabled={
                                        screen === "submitting"
                                    }
                                >
                  <span>
                    {screen === "submitting"
                        ? "Placing order..."
                        : "Place order"}
                  </span>

                                    {screen !==
                                        "submitting" && (
                                            <ActionIcon
                                                isLPC={isLPC}
                                            />
                                        )}
                                </button>
                            </div>
                        </section>

                        {renderOrderSummary()}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={pageClassName}>
            <div className={styles.checkoutShell}>
                {renderProductHeader()}

                <div className={styles.checkoutLayout}>
                    <section className={styles.checkoutCard}>
                        <header
                            className={styles.checkoutHeader}
                        >
                            <p className={styles.studyLabel}>
                                {isMobile
                                    ? `Task 1 · Round ${
                                        conditionIndex + 1
                                    } of 4`
                                    : "Task 1 · Reference"}
                            </p>

                            <h1>Complete your order</h1>

                            <p>
                                Enter the customer, delivery,
                                and payment information.
                            </p>
                        </header>

                        <form
                            className={styles.form}
                            onSubmit={handleReview}
                        >
                            {renderNameSection()}

                            {isLOC ? (
                                <>
                                    {renderDeliverySection()}
                                    {renderFullAddressSection()}
                                </>
                            ) : (
                                <>
                                    {renderSeparateAddressSection()}
                                    {renderDeliverySection()}
                                </>
                            )}

                            {renderPaymentSection()}

                            {error && (
                                <p
                                    className={styles.error}
                                    role="alert"
                                >
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className={
                                    styles.primaryButton
                                }
                            >
                                <span>Review order</span>
                                <ActionIcon isLPC={isLPC} />
                            </button>
                        </form>
                    </section>

                    {renderOrderSummary()}
                </div>
            </div>
        </main>
    );
}
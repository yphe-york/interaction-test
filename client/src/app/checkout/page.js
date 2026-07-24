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
    return `$${Number(value || 0).toFixed(2)}`;
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

    return (
        Number(correctName) +
        Number(correctAddress) +
        Number(correctShipping) +
        Number(correctPayment)
    );
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

function SectionCue({ kind }) {
    const highMapping = {
        customer: ["user", "cueBlue"],
        address: ["pin", "cuePurple"],
        delivery: ["truck", "cueGreen"],
        payment: ["card", "cueOrange"],
    };

    const [iconName, colorClass] = highMapping[kind];

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

function ActionIcon() {
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

        const selectedRound =
            sessionStorage.getItem("selectedRound") || "";

        const storedCondition =
            sessionStorage.getItem("condition") || "";

        if (
            !participantId ||
            !selectedDevice ||
            selectedTask !== "task1"
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
        "task1",
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

    const scenarioProduct =
        scenario.product ??
        scenario.productName ??
        "Product";

    const scenarioPrice =
        scenario.price ??
        scenario.productPrice ??
        0;

    const roundNumber =
        Number(selectedRound) ||
        (isMobile
            ? conditionIndex + 3
            : conditionIndex + 1);

    const trialOrder =
        roundNumber;

    const roundLabel =
        `Task 1 · Round ${roundNumber} of 4`;

    const shippingCost =
        getShippingCost(form.shippingMethod);

    const orderTotal =
        scenarioPrice + (shippingCost ?? 0);

    const enteredAddress = isLOC
        ? form.fullAddress
        : [
            form.streetAddress,
            form.city,
            form.postalCode,
        ]
            .filter(Boolean)
            .join(", ");

    const pageClassName =
        `${styles.page} ${styles.highPerceptual}`;

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
            setError("The trial was not started.");
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
                completionDevice: selectedDevice,
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
        sessionStorage.removeItem("activeTrialId");
        router.push("/");
    }

    function renderNameSection() {
        return (
            <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                    <SectionCue kind="customer" />

                    <span>Customer information</span>
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
                    <SectionCue kind="address" />

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
                    <SectionCue kind="address" />

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
                    <SectionCue kind="delivery" />

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
                    <SectionCue kind="payment" />

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
                            <h3>{scenarioProduct}</h3>
                            <p>Quantity: 1</p>
                        </div>

                        <strong>
                            {formatCurrency(scenarioPrice)}
                        </strong>
                    </div>

                    <div className={styles.totalSection}>
                        <div>
                            <span>Subtotal</span>

                            <strong>
                                {formatCurrency(scenarioPrice)}
                            </strong>
                        </div>

                        <div>
                            <span>Shipping</span>

                            <strong>
                                {shippingCost === null
                                    ? "Not selected"
                                    : shippingCost === 0
                                        ? "Free"
                                        : formatCurrency(
                                            shippingCost,
                                        )}
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
                        {roundLabel}
                    </p>

                    <h1>Checkout task</h1>

                    <p className={styles.description}>
                        Imagine that you are shopping on
                        MarketLane and have added an item to
                        your cart. You are now ready to
                        complete your purchase. On the next
                        screen, enter the customer name,
                        shipping address, delivery method,
                        and payment method using the task
                        information provided to you. Review
                        the information you entered before
                        placing the order.
                    </p>

                    <p className={styles.notice}>
                        Keep the provided task information
                        available while completing the task.
                        After selecting{" "}
                        Begin Task, proceed
                        through the checkout process without
                        going back.
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
                            <ActionIcon />
                        )}
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
                        <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className={styles.buttonIcon}
                        >
                            <path
                                d="m4.5 10 3.3 3.3 7.7-7.6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <h1>Task 1 completed</h1>

                    <p className={styles.description}>
                        Your response has been recorded.
                    </p>

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleContinue}
                    >
                        <span>Return to Homepage</span>
                        <ActionIcon />
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
                        <section className={styles.checkoutCard}>
                            <header className={styles.checkoutHeader}>
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

                            <div className={styles.reviewSection}>
                                <h2>Customer</h2>

                                <div className={styles.reviewRow}>
                                    <span>Full name</span>

                                    <strong>
                                        {form.fullName}
                                    </strong>
                                </div>
                            </div>

                            <div className={styles.reviewSection}>
                                <h2>Shipping address</h2>

                                <div className={styles.reviewRow}>
                                    <span>Address</span>

                                    <strong>
                                        {enteredAddress}
                                    </strong>
                                </div>
                            </div>

                            <div className={styles.reviewSection}>
                                <h2>
                                    Delivery and payment
                                </h2>

                                <div className={styles.reviewRow}>
                                    <span>
                                        Shipping method
                                    </span>

                                    <strong>
                                        {getShippingLabel(
                                            form.shippingMethod,
                                        )}
                                    </strong>
                                </div>

                                <div className={styles.reviewRow}>
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

                            <div className={styles.reviewActions}>
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

                                    {screen !== "submitting" && (
                                        <ActionIcon />
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
                        <header className={styles.checkoutHeader}>
                            <p className={styles.studyLabel}>
                                {roundLabel}
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
                                className={styles.primaryButton}
                            >
                                <span>Review order</span>
                                <ActionIcon />
                            </button>
                        </form>
                    </section>

                    {renderOrderSummary()}
                </div>
            </div>
        </main>
    );
}
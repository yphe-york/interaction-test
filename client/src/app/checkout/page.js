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

const CHECKOUT_SCENARIOS = [
    {
        product: "Wireless Headphones",
        price: 79.99,
        fullName: "Taylor Chen",
        streetAddress: "100 College St",
        city: "Toronto",
        postalCode: "M1M 1X1",
        shippingMethod: "standard",
        paymentMethod: "study-card",
    },
    {
        product: "Mechanical Keyboard",
        price: 89.99,
        fullName: "Jordan Lee",
        streetAddress: "240 King St W",
        city: "Toronto",
        postalCode: "M5V 1H8",
        shippingMethod: "express",
        paymentMethod: "paypal",
    },
    {
        product: "Desk Lamp",
        price: 49.99,
        fullName: "Alex Morgan",
        streetAddress: "85 Queen St E",
        city: "Toronto",
        postalCode: "M5C 1S1",
        shippingMethod: "standard",
        paymentMethod: "paypal",
    },
    {
        product: "Travel Backpack",
        price: 64.99,
        fullName: "Casey Wong",
        streetAddress: "310 Front St W",
        city: "Toronto",
        postalCode: "M5V 3B5",
        shippingMethod: "express",
        paymentMethod: "study-card",
    },
    {
        product: "Web Camera",
        price: 74.99,
        fullName: "Jamie Patel",
        streetAddress: "55 Bloor St W",
        city: "Toronto",
        postalCode: "M4W 1A5",
        shippingMethod: "standard",
        paymentMethod: "study-card",
    },
];

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

export default function CheckoutPage() {
    const router = useRouter();

    const [participantId, setParticipantId] = useState("");
    const [selectedDevice, setSelectedDevice] = useState("");
    const [conditionIndex, setConditionIndex] = useState(0);

    const [trialId, setTrialId] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });

    const [screen, setScreen] = useState("loading");
    const [error, setError] = useState("");

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
        CHECKOUT_SCENARIOS[scenarioIndex] ||
        CHECKOUT_SCENARIOS[0];

    const trialOrder = isMobile
        ? conditionIndex + 2
        : 1;

    useEffect(() => {
        const storedParticipantId =
            sessionStorage.getItem("participantId");

        const storedDevice =
            sessionStorage.getItem("selectedDevice");

        const storedTask =
            sessionStorage.getItem("selectedTask");

        if (
            !storedParticipantId ||
            !storedDevice ||
            storedTask !== "task1"
        ) {
            router.replace("/");
            return;
        }

        let storedConditionIndex = Number(
            sessionStorage.getItem("conditionIndex") || "0",
        );

        if (
            storedDevice !== "mobile" ||
            storedConditionIndex < 0 ||
            storedConditionIndex >= MOBILE_CONDITIONS.length
        ) {
            storedConditionIndex = 0;
        }

        setParticipantId(storedParticipantId);
        setSelectedDevice(storedDevice);
        setConditionIndex(storedConditionIndex);
        setScreen("instructions");
    }, [router]);

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
            console.error("Unable to start trial:", caughtError);

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
            console.error("Unable to complete trial:", caughtError);

            setError(
                caughtError.message ||
                "Unable to submit the task.",
            );

            setScreen("checkout");
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

            setConditionIndex(nextConditionIndex);
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

    if (screen === "loading") {
        return (
            <main className={styles.page}>
                <section className={styles.card}>
                    <p>Loading task...</p>
                </section>
            </main>
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
                            ? `Task 1 · Round ${conditionIndex + 1} of 4`
                            : "Task 1 · Reference"}
                    </p>

                    <h1>Checkout Task</h1>

                    <p className={styles.description}>
                        Use the information below to complete the checkout.
                    </p>

                    <div className={styles.instructions}>
                        <dl className={styles.taskDetails}>
                            <div>
                                <dt>Product</dt>
                                <dd>{scenario.product}</dd>
                            </div>

                            <div>
                                <dt>Full name</dt>
                                <dd>{scenario.fullName}</dd>
                            </div>

                            {isLOC ? (
                                <div>
                                    <dt>Full address</dt>
                                    <dd>{getFullAddress(scenario)}</dd>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <dt>Street address</dt>
                                        <dd>{scenario.streetAddress}</dd>
                                    </div>

                                    <div>
                                        <dt>City</dt>
                                        <dd>{scenario.city}</dd>
                                    </div>

                                    <div>
                                        <dt>Postal code</dt>
                                        <dd>{scenario.postalCode}</dd>
                                    </div>
                                </>
                            )}

                            <div>
                                <dt>Shipping method</dt>
                                <dd>
                                    {scenario.shippingMethod === "standard"
                                        ? "Standard shipping"
                                        : "Express shipping"}
                                </dd>
                            </div>

                            <div>
                                <dt>Payment method</dt>
                                <dd>
                                    {scenario.paymentMethod === "study-card"
                                        ? "Study Card"
                                        : "PayPal"}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <p className={styles.notice}>
                        The timer starts when you select Begin Task.
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
                            : "Task 1 Completed"}
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
            <div className={styles.checkoutLayout}>
                <section className={styles.checkoutCard}>
                    <header className={styles.checkoutHeader}>
                        <p className={styles.studyLabel}>
                            {isMobile
                                ? `Task 1 · Round ${conditionIndex + 1} of 4`
                                : "Task 1 · Reference"}
                        </p>

                        <h1>Checkout</h1>
                    </header>

                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                    >
                        <section className={styles.formSection}>
                            <h2>Customer Information</h2>

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

                        {isLOC ? (
                            <>
                                <section className={styles.formSection}>
                                    <h2>Delivery</h2>

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

                                <section className={styles.formSection}>
                                    <h2>Shipping Address</h2>

                                    <label>
                                        <span>Full address</span>

                                        <input
                                            type="text"
                                            name="fullAddress"
                                            value={form.fullAddress}
                                            onChange={handleChange}
                                            placeholder="100 College St, Toronto, M1M 1X1"
                                            autoComplete="off"
                                            required
                                        />
                                    </label>
                                </section>
                            </>
                        ) : (
                            <>
                                <section className={styles.formSection}>
                                    <h2>Shipping Address</h2>

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

                                <section className={styles.formSection}>
                                    <h2>Delivery</h2>

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
                            </>
                        )}

                        <section className={styles.formSection}>
                            <h2>Payment</h2>

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
                                ? "Submitting..."
                                : "Place Order"}
                        </button>
                    </form>
                </section>

                <aside className={styles.summaryCard}>
                    <h2>Order Details</h2>

                    <div className={styles.product}>
                        <div>
                            <h3>{scenario.product}</h3>
                            <p>Quantity: 1</p>
                        </div>

                        <strong>
                            ${scenario.price.toFixed(2)}
                        </strong>
                    </div>

                    <dl className={styles.summaryDetails}>
                        <div>
                            <dt>Name</dt>
                            <dd>{scenario.fullName}</dd>
                        </div>

                        {isLOC ? (
                            <div>
                                <dt>Address</dt>
                                <dd>{getFullAddress(scenario)}</dd>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <dt>Street</dt>
                                    <dd>{scenario.streetAddress}</dd>
                                </div>

                                <div>
                                    <dt>City</dt>
                                    <dd>{scenario.city}</dd>
                                </div>

                                <div>
                                    <dt>Postal code</dt>
                                    <dd>{scenario.postalCode}</dd>
                                </div>
                            </>
                        )}

                        <div>
                            <dt>Shipping</dt>
                            <dd>
                                {scenario.shippingMethod === "standard"
                                    ? "Standard"
                                    : "Express"}
                            </dd>
                        </div>

                        <div>
                            <dt>Payment</dt>
                            <dd>
                                {scenario.paymentMethod === "study-card"
                                    ? "Study Card"
                                    : "PayPal"}
                            </dd>
                        </div>
                    </dl>
                </aside>
            </div>
        </main>
    );
}
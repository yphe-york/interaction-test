export const MOBILE_CONDITIONS = [
    "HPC-HOC",
    "HPC-LOC",
    "LPC-HOC",
    "LPC-LOC",
];

export const CHECKOUT_SCENARIOS = [
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

export const PASSWORD_SCENARIOS = [
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

export const SUPPORT_TICKET_SCENARIOS = [
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

export const TASK_CONFIG = {
    task1: {
        title: "Checkout",
        taskName: "checkout",
        route: "/checkout",
        scenarios: CHECKOUT_SCENARIOS,
    },
    task2: {
        title: "Change Password",
        taskName: "change-password",
        route: "/change-password",
        scenarios: PASSWORD_SCENARIOS,
    },
    task3: {
        title: "Support Ticket",
        taskName: "support-ticket",
        route: "/support-ticket",
        scenarios: SUPPORT_TICKET_SCENARIOS,
    },
};

export function getScenarioIndex(
    selectedDevice,
    conditionIndex = 0,
) {
    if (selectedDevice === "mobile") {
        const parsedConditionIndex = Number(conditionIndex);

        if (
            Number.isInteger(parsedConditionIndex) &&
            parsedConditionIndex >= 0 &&
            parsedConditionIndex < MOBILE_CONDITIONS.length
        ) {
            return parsedConditionIndex + 1;
        }
    }

    return 0;
}

export function getTaskScenario(
    taskKey,
    selectedDevice,
    conditionIndex = 0,
) {
    const task = TASK_CONFIG[taskKey];

    if (!task) {
        throw new Error(`Unknown task key: ${taskKey}`);
    }

    const scenarioIndex = getScenarioIndex(
        selectedDevice,
        conditionIndex,
    );

    const scenario = task.scenarios[scenarioIndex];

    if (!scenario) {
        throw new Error(
            `Scenario ${scenarioIndex} does not exist for ${taskKey}.`,
        );
    }

    return scenario;
}

export function getMobileCondition(conditionIndex = 0) {
    const parsedConditionIndex = Number(conditionIndex);

    if (
        !Number.isInteger(parsedConditionIndex) ||
        parsedConditionIndex < 0 ||
        parsedConditionIndex >= MOBILE_CONDITIONS.length
    ) {
        return MOBILE_CONDITIONS[0];
    }

    return MOBILE_CONDITIONS[parsedConditionIndex];
}
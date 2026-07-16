export const TASK_IDS = {
    CHECKOUT: "task1",
    PASSWORD: "task2",
    SUPPORT: "task3",
};

export const MOBILE_CONDITIONS = [
    "HPC-HOC",
    "HPC-LOC",
];

export const TASK_CONFIG = {
    task1: {
        name: "Online Checkout",
        path: "/checkout",
        scenarios: [
            {
                product: "Wireless Headphones",
                productName: "Wireless Headphones",
                price: 79.99,
                productPrice: 79.99,
                fullName: "Taylor Chen",
                streetAddress: "100 College St",
                city: "Toronto",
                postalCode: "M1M 1X1",
                fullAddress: "100 College St, Toronto, M1M 1X1",
                shippingMethod: "standard",
                paymentMethod: "study-card",
            },
            {
                product: "Mechanical Keyboard",
                productName: "Mechanical Keyboard",
                price: 89.99,
                productPrice: 89.99,
                fullName: "Jordan Lee",
                streetAddress: "240 King St W",
                city: "Toronto",
                postalCode: "M5V 1H8",
                fullAddress: "240 King St W, Toronto, M5V 1H8",
                shippingMethod: "express",
                paymentMethod: "paypal",
            },
            {
                product: "Desk Lamp",
                productName: "Desk Lamp",
                price: 49.99,
                productPrice: 49.99,
                fullName: "Alex Morgan",
                streetAddress: "85 Queen St E",
                city: "Toronto",
                postalCode: "M5C 1S1",
                fullAddress: "85 Queen St E, Toronto, M5C 1S1",
                shippingMethod: "standard",
                paymentMethod: "paypal",
            },
            {
                product: "Travel Backpack",
                productName: "Travel Backpack",
                price: 64.99,
                productPrice: 64.99,
                fullName: "Casey Wong",
                streetAddress: "310 Front St W",
                city: "Toronto",
                postalCode: "M5V 3B5",
                fullAddress: "310 Front St W, Toronto, M5V 3B5",
                shippingMethod: "express",
                paymentMethod: "study-card",
            },
        ],
    },

    task2: {
        name: "Change Password",
        path: "/change-password",
        scenarios: [
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
        ],
    },

    task3: {
        name: "Support Ticket",
        path: "/support-ticket",
        scenarios: [
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
        ],
    },
};

export function getMobileCondition(conditionIndex = 0) {
    const index = Number(conditionIndex) || 0;

    return (
        MOBILE_CONDITIONS[index % MOBILE_CONDITIONS.length] ||
        MOBILE_CONDITIONS[0]
    );
}

export function getTaskScenario(
    taskId,
    selectedDevice = "desktop",
    conditionIndex = 0,
) {
    const task = TASK_CONFIG[taskId];

    if (!task) {
        return null;
    }

    const index = Number(conditionIndex) || 0;

    const scenarioIndex =
        selectedDevice === "mobile"
            ? index + 2
            : index;

    return (
        task.scenarios[scenarioIndex] ||
        task.scenarios[index] ||
        task.scenarios[0]
    );
}

export function getTaskPath(taskId) {
    return TASK_CONFIG[taskId]?.path || "/";
}
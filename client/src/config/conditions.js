export const CONDITIONS = {
    "HPC-HOC": {
        perceptualConsistency: "high",
        operationalConsistency: "high",
    },

    "HPC-LOC": {
        perceptualConsistency: "high",
        operationalConsistency: "low",
    },

    "LPC-HOC": {
        perceptualConsistency: "low",
        operationalConsistency: "high",
    },

    "LPC-LOC": {
        perceptualConsistency: "low",
        operationalConsistency: "low",
    },
};

export function getConditionConfig(conditionName) {
    return CONDITIONS[conditionName] || CONDITIONS["HPC-HOC"];
}
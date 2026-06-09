const aiAnalyticsModel = require("../models/aiAnalytics.model");

async function logAiRequest({ provider, model, user, feature, inputTokens = 0, outputTokens = 0, latencyMs, success, errorMessage = null }) {
    try {
        await aiAnalyticsModel.create({
            provider,
            model,
            user: user || null,
            feature: feature || "General",
            inputTokens: inputTokens || 0,
            outputTokens: outputTokens || 0,
            totalTokens: (inputTokens || 0) + (outputTokens || 0),
            latencyMs: latencyMs || 0,
            success,
            errorMessage: errorMessage || null
        });
    } catch (err) {
        console.error("Failed to save AI request analytics to database:", err.message);
    }
}

module.exports = {
    logAiRequest
};

const mongoose = require("mongoose");

const aiAnalyticsSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
        enum: ["Gemini", "Groq"]
    },
    model: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: false
    },
    feature: {
        type: String,
        required: true,
        default: "General"
    },
    inputTokens: {
        type: Number,
        default: 0
    },
    outputTokens: {
        type: Number,
        default: 0
    },
    totalTokens: {
        type: Number,
        default: 0
    },
    latencyMs: {
        type: Number,
        required: true
    },
    success: {
        type: Boolean,
        required: true
    },
    errorMessage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const aiAnalyticsModel = mongoose.model("AiAnalytics", aiAnalyticsSchema);
module.exports = aiAnalyticsModel;

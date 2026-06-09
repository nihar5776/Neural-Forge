const mongoose = require("mongoose");

const systemHealthSchema = new mongoose.Schema({
    service: {
        type: String,
        enum: ['backend', 'mongodb', 'gemini', 'groq'],
        required: true
    },
    status: {
        type: String,
        enum: ['healthy', 'unhealthy'],
        required: true
    },
    responseTimeMs: {
        type: Number,
        required: true
    },
    uptime: {
        type: Number, // Uptime in seconds, if available
        default: null
    },
    error: {
        type: String,
        default: null
    },
    checkedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// Auto-expire health logs older than 7 days
systemHealthSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

const systemHealthModel = mongoose.model("SystemHealth", systemHealthSchema);

module.exports = systemHealthModel;

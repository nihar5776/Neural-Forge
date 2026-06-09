const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        default: "Unknown"
    },
    userAgent: {
        type: String,
        default: "Unknown"
    },
    loginAt: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    },
    logoutAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const sessionModel = mongoose.model("Session", sessionSchema);

module.exports = sessionModel;

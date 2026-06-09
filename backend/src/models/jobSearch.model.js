const mongoose = require("mongoose");

const jobSearchSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const jobSearchModel = mongoose.model("JobSearch", jobSearchSchema);

module.exports = jobSearchModel;

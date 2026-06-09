const userModel = require("../models/user.models");
const interviewReportModel = require("../models/interviewReportModel");
const mockInterviewModel = require("../models/mockInterview.model");
const aiAnalyticsModel = require("../models/aiAnalytics.model");
const { exportStream } = require("../services/export.service");

// Common wrapper to manage streams and catch failures cleanly
const handleExport = async (res, format, cursor, columns, rowMapper, title) => {
    try {
        const fmt = (format || 'csv').toLowerCase();
        if (!['csv', 'xlsx', 'pdf'].includes(fmt)) {
            return res.status(400).json({
                status: "Failed",
                message: "Unsupported format. Must be 'csv', 'xlsx', or 'pdf'."
            });
        }
        await exportStream(res, fmt, cursor, columns, rowMapper, title);
    } catch (error) {
        console.error(`Export ${title} Error:`, error);
        if (!res.headersSent) {
            return res.status(500).json({
                status: "Failed",
                message: `Failed to export ${title} report.`,
                error: error.message
            });
        }
        res.end(); // Terminate stream if headers were already sent
    }
};

/**
 * Export Users Report
 */
async function exportUsers(req, res) {
    const { format } = req.query;
    const cursor = userModel.find().sort({ createdAt: -1 }).cursor();

    const columns = [
        { header: "User ID", key: "_id", width: 26, pdfWidth: 80 },
        { header: "Name", key: "name", width: 22, pdfWidth: 90 },
        { header: "Email Address", key: "email", width: 28, pdfWidth: 120 },
        { header: "Role", key: "role", width: 12, pdfWidth: 50 },
        { header: "Status", key: "status", width: 12, pdfWidth: 50 },
        { header: "Last Active", key: "lastActiveAt", width: 22, pdfWidth: 85 },
        { header: "Created At", key: "createdAt", width: 22, pdfWidth: 60 }
    ];

    const rowMapper = (doc) => ({
        _id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        status: doc.status,
        lastActiveAt: doc.lastActiveAt ? new Date(doc.lastActiveAt).toLocaleString() : "N/A",
        createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A"
    });

    await handleExport(res, format, cursor, columns, rowMapper, "Users");
}

/**
 * Export ATS reports (Resume Analyses)
 */
async function exportAtsReports(req, res) {
    const { format } = req.query;
    const cursor = interviewReportModel.find()
        .populate("user", "email")
        .sort({ createdAt: -1 })
        .cursor();

    const columns = [
        { header: "Report ID", key: "_id", width: 26, pdfWidth: 90 },
        { header: "Job Title", key: "title", width: 24, pdfWidth: 100 },
        { header: "User Email", key: "userEmail", width: 28, pdfWidth: 125 },
        { header: "ATS Match Score", key: "matchScore", width: 18, pdfWidth: 70 },
        { header: "Resume Path/URL", key: "resume", width: 24, pdfWidth: 90 },
        { header: "Created At", key: "createdAt", width: 22, pdfWidth: 60 }
    ];

    const rowMapper = (doc) => ({
        _id: doc._id.toString(),
        title: doc.title,
        userEmail: doc.user ? doc.user.email : "N/A",
        matchScore: doc.matchScore !== undefined && doc.matchScore !== null ? `${doc.matchScore}%` : "N/A",
        resume: doc.resume || "N/A",
        createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A"
    });

    await handleExport(res, format, cursor, columns, rowMapper, "ATS Reports");
}

/**
 * Export Interview Reports (Mock Interviews)
 */
async function exportInterviews(req, res) {
    const { format } = req.query;
    const cursor = mockInterviewModel.find()
        .populate("user", "email")
        .sort({ createdAt: -1 })
        .cursor();

    const columns = [
        { header: "Interview ID", key: "_id", width: 26, pdfWidth: 80 },
        { header: "User Email", key: "userEmail", width: 28, pdfWidth: 95 },
        { header: "Job Role", key: "jobRole", width: 22, pdfWidth: 80 },
        { header: "Difficulty", key: "difficulty", width: 14, pdfWidth: 50 },
        { header: "Overall Score", key: "overallScore", width: 15, pdfWidth: 50 },
        { header: "Technical Score", key: "technicalScore", width: 15, pdfWidth: 50 },
        { header: "Comm. Score", key: "communicationScore", width: 15, pdfWidth: 50 },
        { header: "Status", key: "status", width: 14, pdfWidth: 40 },
        { header: "Created At", key: "createdAt", width: 22, pdfWidth: 40 }
    ];

    const rowMapper = (doc) => ({
        _id: doc._id.toString(),
        userEmail: doc.user ? doc.user.email : "N/A",
        jobRole: doc.jobRole,
        difficulty: doc.difficulty,
        overallScore: doc.overallScore !== null && doc.overallScore !== undefined ? doc.overallScore : "N/A",
        technicalScore: doc.technicalScore !== null && doc.technicalScore !== undefined ? doc.technicalScore : "N/A",
        communicationScore: doc.communicationScore !== null && doc.communicationScore !== undefined ? doc.communicationScore : "N/A",
        status: doc.status,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A"
    });

    await handleExport(res, format, cursor, columns, rowMapper, "Mock Interviews");
}

/**
 * Export AI Analytics Logs
 */
async function exportAiAnalytics(req, res) {
    const { format } = req.query;
    const cursor = aiAnalyticsModel.find()
        .populate("user", "email")
        .sort({ createdAt: -1 })
        .cursor();

    const columns = [
        { header: "Log ID", key: "_id", width: 26, pdfWidth: 70 },
        { header: "Provider", key: "provider", width: 12, pdfWidth: 45 },
        { header: "Model", key: "model", width: 20, pdfWidth: 75 },
        { header: "User Email", key: "userEmail", width: 24, pdfWidth: 95 },
        { header: "Feature Used", key: "feature", width: 18, pdfWidth: 65 },
        { header: "Total Tokens", key: "totalTokens", width: 14, pdfWidth: 50 },
        { header: "Latency", key: "latencyMs", width: 14, pdfWidth: 45 },
        { header: "Success", key: "success", width: 12, pdfWidth: 40 },
        { header: "Timestamp", key: "createdAt", width: 22, pdfWidth: 50 }
    ];

    const rowMapper = (doc) => ({
        _id: doc._id.toString(),
        provider: doc.provider,
        model: doc.model,
        userEmail: doc.user ? doc.user.email : "N/A",
        feature: doc.feature,
        totalTokens: doc.totalTokens || 0,
        latencyMs: doc.latencyMs ? `${doc.latencyMs}ms` : "N/A",
        success: doc.success ? "Yes" : "No",
        createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A"
    });

    await handleExport(res, format, cursor, columns, rowMapper, "AI Analytics");
}

module.exports = {
    exportUsers,
    exportAtsReports,
    exportInterviews,
    exportAiAnalytics
};

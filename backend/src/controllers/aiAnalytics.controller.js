const aiAnalyticsService = require("../services/aiAnalytics.service");

/**
 * Fetch AI analytics statistics for the admin dashboard
 */
async function getAiAnalyticsDashboard(req, res) {
    try {
        const stats = await aiAnalyticsService.getAiAnalyticsStats();
        return res.status(200).json({
            status: "Success",
            data: stats
        });
    } catch (error) {
        console.error("AI Analytics Stats Fetch Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to fetch AI analytics dashboard statistics.",
            error: error.message
        });
    }
}

module.exports = {
    getAiAnalyticsDashboard
};

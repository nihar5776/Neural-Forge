const dashboardService = require("../services/dashboard.service");

async function getAdminDashboard(req, res) {
    try {
        const stats = await dashboardService.getDashboardStats();
        return res.status(200).json({
            status: "Success",
            data: stats
        });
    } catch (error) {
        console.error("Dashboard Stats Fetch Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to fetch admin dashboard statistics.",
            error: error.message
        });
    }
}

module.exports = {
    getAdminDashboard
};

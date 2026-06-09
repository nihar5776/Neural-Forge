const mongoose = require("mongoose");
const systemHealthService = require("../services/systemHealth.service");

/**
 * Returns detailed live status, response times, uptime, and rolling SLA metrics for admins.
 */
async function getSystemHealth(req, res) {
    try {
        // Run checks to get current metrics
        const currentStats = await systemHealthService.runAndSaveHealthChecks();
        
        // Fetch 24-hour rolling SLA metrics
        const rollingSla = await systemHealthService.getRollingSLA();

        // Merge current stats with rolling SLA metrics
        const formattedMetrics = currentStats.map(stat => ({
            service: stat.service,
            status: stat.status,
            responseTimeMs: stat.responseTimeMs,
            uptime: stat.uptime,
            rollingUptimeSla: Number((rollingSla[stat.service] || 100).toFixed(2)),
            lastCheckedAt: stat.checkedAt,
            error: stat.error
        }));

        return res.status(200).json({
            status: "Success",
            data: formattedMetrics
        });
    } catch (error) {
        console.error("Get System Health Controller Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to retrieve system health metrics.",
            error: error.message
        });
    }
}

/**
 * Public endpoint for load-balancers (checks backend and mongodb only).
 */
async function getPublicHealth(req, res) {
    try {
        // Quick database connectivity check
        const dbConnected = mongoose.connection.readyState === 1;
        
        if (!dbConnected) {
            return res.status(503).json({
                status: "unhealthy",
                reason: "Database connection down"
            });
        }

        return res.status(200).json({
            status: "healthy"
        });
    } catch (error) {
        return res.status(503).json({
            status: "unhealthy",
            reason: error.message || "Unknown error"
        });
    }
}

module.exports = {
    getSystemHealth,
    getPublicHealth
};

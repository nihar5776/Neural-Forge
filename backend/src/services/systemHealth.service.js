const mongoose = require("mongoose");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");
const systemHealthModel = require("../models/systemHealth.model");

// Measure event loop responsiveness
const checkBackend = async () => {
    const start = Date.now();
    await new Promise(resolve => setImmediate(resolve));
    const delay = Date.now() - start;
    return {
        status: 'healthy',
        responseTimeMs: delay,
        uptime: process.uptime()
    };
};

// Measure MongoDB connection state and latency
const checkMongoDB = async () => {
    const start = Date.now();
    if (mongoose.connection.readyState !== 1) {
        throw new Error(`MongoDB not connected. ReadyState: ${mongoose.connection.readyState}`);
    }
    await mongoose.connection.db.admin().ping();
    const responseTimeMs = Date.now() - start;
    
    let dbUptime = null;
    try {
        const statusResult = await mongoose.connection.db.admin().serverStatus();
        dbUptime = statusResult.uptime;
    } catch (err) {
        // Fallback to process uptime if serverStatus permissions are restricted (e.g. Atlas shared clusters)
        dbUptime = process.uptime();
    }

    return {
        status: 'healthy',
        responseTimeMs,
        uptime: dbUptime
    };
};

// Check Gemini API responsiveness
const checkGemini = async () => {
    const start = Date.now();
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not defined");
    }
    const localAi = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
    // Fetch models/gemini-2.5-flash details as a quick, token-free connection validation
    await localAi.models.get({ model: 'models/gemini-2.5-flash' });
    const responseTimeMs = Date.now() - start;
    return {
        status: 'healthy',
        responseTimeMs,
        uptime: null
    };
};

// Check Groq API responsiveness
const checkGroq = async () => {
    const start = Date.now();
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY environment variable is not defined");
    }
    // Perform models list query to verify credentials and endpoint latency
    await axios.get('https://api.groq.com/openai/v1/models', {
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        timeout: 5000
    });
    const responseTimeMs = Date.now() - start;
    return {
        status: 'healthy',
        responseTimeMs,
        uptime: null
    };
};

// Helper to handle service checks safely
const runCheck = async (serviceName, checkFn) => {
    const start = Date.now();
    try {
        const result = await checkFn();
        return {
            service: serviceName,
            status: result.status,
            responseTimeMs: result.responseTimeMs,
            uptime: result.uptime,
            error: null,
            checkedAt: new Date()
        };
    } catch (err) {
        return {
            service: serviceName,
            status: 'unhealthy',
            responseTimeMs: Date.now() - start,
            uptime: null,
            error: err.message || "Unknown health check failure",
            checkedAt: new Date()
        };
    }
};

// Run all checks and save database records
const runAndSaveHealthChecks = async () => {
    const checks = [
        runCheck('backend', checkBackend),
        runCheck('mongodb', checkMongoDB),
        runCheck('gemini', checkGemini),
        runCheck('groq', checkGroq)
    ];

    const results = await Promise.all(checks);
    
    // Save to database
    await systemHealthModel.insertMany(results).catch(err => {
        console.error("Failed to insert health check logs into database:", err.message);
    });

    return results;
};

// Compute rolling SLA/Uptime percentage over the last 24 hours
const getRollingSLA = async (hours = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const aggregates = await systemHealthModel.aggregate([
        { $match: { checkedAt: { $gte: cutoff } } },
        {
            $group: {
                _id: "$service",
                total: { $sum: 1 },
                healthy: {
                    $sum: { $cond: [{ $eq: ["$status", "healthy"] }, 1, 0] }
                }
            }
        }
    ]);

    const slaMap = {};
    aggregates.forEach(item => {
        slaMap[item._id] = item.total > 0 ? (item.healthy / item.total) * 100 : 100;
    });

    // Default missing services to 100% (e.g. at system startup before logs accumulate)
    ['backend', 'mongodb', 'gemini', 'groq'].forEach(service => {
        if (slaMap[service] === undefined) {
            slaMap[service] = 100;
        }
    });

    return slaMap;
};

// Scheduled background monitoring configuration
let monitorIntervalId = null;

const startHealthScheduler = (intervalMs = 5 * 60 * 1000) => {
    if (monitorIntervalId) {
        clearInterval(monitorIntervalId);
    }

    // Run first check immediately on startup
    runAndSaveHealthChecks().catch(err => console.error("Startup health checks failed:", err.message));

    monitorIntervalId = setInterval(async () => {
        try {
            await runAndSaveHealthChecks();
        } catch (err) {
            console.error("Scheduled background check error:", err.message);
        }
    }, intervalMs);

    console.log(`System Health scheduled monitor started. Running every ${intervalMs / 60000} minutes.`);
};

const stopHealthScheduler = () => {
    if (monitorIntervalId) {
        clearInterval(monitorIntervalId);
        monitorIntervalId = null;
        console.log("System Health scheduled monitor stopped.");
    }
};

module.exports = {
    runAndSaveHealthChecks,
    getRollingSLA,
    startHealthScheduler,
    stopHealthScheduler
};

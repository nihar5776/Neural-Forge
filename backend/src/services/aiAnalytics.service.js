const aiAnalyticsModel = require("../models/aiAnalytics.model");

/**
 * Retrieve AI usage aggregation metrics (Gemini vs Groq, latency, failure/success, costs)
 */
async function getAiAnalyticsStats() {
    const stats = await aiAnalyticsModel.aggregate([
        {
            $facet: {
                // Total Gemini Requests count
                geminiRequests: [
                    { $match: { provider: "Gemini" } },
                    { $count: "count" }
                ],
                // Total Groq Requests count
                groqRequests: [
                    { $match: { provider: "Groq" } },
                    { $count: "count" }
                ],
                // Success / Failure metrics grouping
                statusMetrics: [
                    {
                        $group: {
                            _id: "$success",
                            count: { $sum: 1 }
                        }
                    }
                ],
                // Average Latency calculation
                latencyMetrics: [
                    {
                        $group: {
                            _id: null,
                            avgLatency: { $avg: "$latencyMs" }
                        }
                    }
                ],
                // Estimated cost calculations based on provider/model prices
                costMetrics: [
                    {
                        $project: {
                            cost: {
                                $cond: {
                                    if: { $eq: ["$provider", "Gemini"] },
                                    then: {
                                        $add: [
                                            { $multiply: [{ $ifNull: ["$inputTokens", 0] }, 0.000000075] },  // $0.075 / 1M input tokens
                                            { $multiply: [{ $ifNull: ["$outputTokens", 0] }, 0.00000030] }   // $0.30 / 1M output tokens
                                        ]
                                    },
                                    else: {
                                        $cond: {
                                            if: { $eq: ["$model", "whisper-large-v3"] },
                                            then: 0.001, // Flat $0.001 per transcription request
                                            else: {
                                                $add: [
                                                    { $multiply: [{ $ifNull: ["$inputTokens", 0] }, 0.00000059] },  // $0.59 / 1M input tokens (Llama 3)
                                                    { $multiply: [{ $ifNull: ["$outputTokens", 0] }, 0.00000079] }   // $0.79 / 1M output tokens (Llama 3)
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalCost: { $sum: "$cost" }
                        }
                    }
                ]
            }
        }
    ]);

    const result = stats[0];

    const totalGemini = result?.geminiRequests[0]?.count || 0;
    const totalGroq = result?.groqRequests[0]?.count || 0;
    const totalRequests = totalGemini + totalGroq;

    let successCount = 0;
    let failedCount = 0;
    if (result?.statusMetrics) {
        result.statusMetrics.forEach(m => {
            if (m._id === true) successCount = m.count;
            if (m._id === false) failedCount = m.count;
        });
    }

    const successRate = totalRequests > 0 ? Math.round((successCount / totalRequests) * 1000) / 10 : 100;
    const avgLatency = result?.latencyMetrics[0]?.avgLatency ? Math.round(result.latencyMetrics[0].avgLatency) : 0;
    const totalCost = result?.costMetrics[0]?.totalCost ? Math.round(result.costMetrics[0].totalCost * 100000) / 100000 : 0; // round to 5 decimal places

    return {
        totalGeminiRequests: totalGemini,
        totalGroqRequests: totalGroq,
        successRate,
        failedRequests: failedCount,
        averageLatency: avgLatency,
        estimatedCost: totalCost
    };
}

module.exports = {
    getAiAnalyticsStats
};

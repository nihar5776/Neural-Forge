const userModel = require("../models/user.models");
const interviewReportModel = require("../models/interviewReportModel");
const mockInterviewModel = require("../models/mockInterview.model");
const { quizModel } = require("../models/quiz.model");
const jobSearchModel = require("../models/jobSearch.model");

async function getDashboardStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendStart = new Date();
    trendStart.setDate(trendStart.getDate() - 6);
    trendStart.setHours(0, 0, 0, 0);

    const matchStage = {
        $match: {
            createdAt: { $gte: trendStart }
        }
    };

    const groupStage = {
        $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
        }
    };

    // Parallel aggregate pipelines for maximum performance
    const [
        userStats,
        resumeStats,
        mockInterviewStats,
        quizStats,
        jobSearchStats,
        mockTrend,
        reportTrend,
        quizTrend,
        jobTrend
    ] = await Promise.all([
        // Aggregation for User Metrics using $facet to fetch all user stats in a single db query
        userModel.aggregate([
            {
                $facet: {
                    totalUsers: [{ $count: "count" }],
                    activeUsers: [
                        { $match: { lastActiveAt: { $gte: thirtyDaysAgo } } },
                        { $count: "count" }
                    ],
                    newUsersThisWeek: [
                        { $match: { createdAt: { $gte: sevenDaysAgo } } },
                        { $count: "count" }
                    ]
                }
            }
        ]),
        // Aggregation for Resume Analyses & Average ATS Score
        interviewReportModel.aggregate([
            {
                $facet: {
                    totalAnalyses: [{ $count: "count" }],
                    averageAtsScore: [
                        {
                            $group: {
                                _id: null,
                                average: { $avg: "$matchScore" }
                            }
                        }
                    ]
                }
            }
        ]),
        // Mock Interviews aggregation count
        mockInterviewModel.aggregate([
            { $count: "count" }
        ]),
        // Quiz Attempts aggregation count
        quizModel.aggregate([
            { $count: "count" }
        ]),
        // Job Searches aggregation count
        jobSearchModel.aggregate([
            { $count: "count" }
        ]),
        // Trends for last 7 days
        mockInterviewModel.aggregate([matchStage, groupStage]),
        interviewReportModel.aggregate([matchStage, groupStage]),
        quizModel.aggregate([matchStage, groupStage]),
        jobSearchModel.aggregate([matchStage, groupStage])
    ]);

    // Parse aggregation results and apply fallback defaults
    const totalUsers = userStats[0]?.totalUsers[0]?.count || 0;
    const activeUsers = userStats[0]?.activeUsers[0]?.count || 0;
    const newUsersThisWeek = userStats[0]?.newUsersThisWeek[0]?.count || 0;

    const resumeAnalysesCount = resumeStats[0]?.totalAnalyses[0]?.count || 0;
    const rawAverageAtsScore = resumeStats[0]?.averageAtsScore[0]?.average || 0;
    // Round to one decimal place
    const averageAtsScore = Math.round(rawAverageAtsScore * 10) / 10;

    const mockInterviewsCount = mockInterviewStats[0]?.count || 0;
    const quizAttemptsCount = quizStats[0]?.count || 0;
    const jobSearchesCount = jobSearchStats[0]?.count || 0;

    // Combine activity trends per day
    const dailyCounts = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        dailyCounts[dateStr] = 0;
    }

    const mergeCounts = (array) => {
        if (Array.isArray(array)) {
            array.forEach(item => {
                if (item && item._id && dailyCounts[item._id] !== undefined) {
                    dailyCounts[item._id] += item.count || 0;
                }
            });
        }
    };

    mergeCounts(mockTrend);
    mergeCounts(reportTrend);
    mergeCounts(quizTrend);
    mergeCounts(jobTrend);

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const activityTrend = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const dayName = weekdays[d.getUTCDay()];
        activityTrend.push({
            date: dateStr,
            day: dayName,
            count: dailyCounts[dateStr] || 0
        });
    }

    return {
        totalUsers,
        activeUsers,
        resumeAnalysesCount,
        mockInterviewsCount,
        quizAttemptsCount,
        jobSearchesCount,
        averageAtsScore,
        newUsersThisWeek,
        activityTrend
    };
}

module.exports = {
    getDashboardStats
};

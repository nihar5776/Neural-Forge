const userModel = require("../models/user.models");
const { resumeModel } = require("../models/resume.model");
const interviewReportModel = require("../models/interviewReportModel");
const mockInterviewModel = require("../models/mockInterview.model");
const { quizModel } = require("../models/quiz.model");
const jobSearchModel = require("../models/jobSearch.model");

/**
 * Get users with pagination, search, and filtering options
 */
async function getUsers({ page = 1, limit = 10, search = "", role = "", status = "" }) {
    const query = {};

    // Filter by role if provided
    if (role) {
        query.role = role;
    }

    // Filter by status if provided
    if (status) {
        query.status = status;
    }

    // Search query on name or email (case-insensitive regex)
    if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [
            { name: regex },
            { email: regex }
        ];
    }

    // Pagination bounds
    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap at 100 max per page
    const skip = (parsedPage - 1) * parsedLimit;

    // Run query and count concurrently for optimal performance
    const [users, total] = await Promise.all([
        userModel.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .lean(),
        userModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return {
        users,
        pagination: {
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages
        }
    };
}

/**
 * Get detailed user profile by ID
 */
async function getUserById(userId) {
    const user = await userModel.findById(userId).select("-password").lean();
    return user;
}

/**
 * Update user status (suspend or activate)
 */
async function updateUserStatus(userId, status) {
    const user = await userModel.findByIdAndUpdate(
        userId,
        { status },
        { new: true, runValidators: true }
    ).select("-password");
    
    return user;
}

/**
 * Hard delete user and clean up all associated platform documents
 */
async function deleteUser(userId) {
    // 1. Delete user from the main collection
    const result = await userModel.deleteOne({ _id: userId });
    
    if (result.deletedCount > 0) {
        // 2. Cascade delete all associated documents to keep database clean
        await Promise.all([
            resumeModel.deleteMany({ user: userId }).catch(err => console.error("Cascade delete Resumes failed:", err)),
            interviewReportModel.deleteMany({ user: userId }).catch(err => console.error("Cascade delete InterviewReports failed:", err)),
            mockInterviewModel.deleteMany({ user: userId }).catch(err => console.error("Cascade delete MockInterviews failed:", err)),
            quizModel.deleteMany({ user: userId }).catch(err => console.error("Cascade delete Quiz attempts failed:", err)),
            jobSearchModel.deleteMany({ user: userId }).catch(err => console.error("Cascade delete JobSearches failed:", err))
        ]);
    }

    return result.deletedCount > 0;
}

module.exports = {
    getUsers,
    getUserById,
    updateUserStatus,
    deleteUser
};

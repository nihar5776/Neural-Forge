const userManagementService = require("../services/userManagement.service");

/**
 * GET /api/admin/users
 * Retrieve all users with search, filtering, and pagination support.
 */
async function getUsersController(req, res) {
    try {
        const { page, limit, search, role, status } = req.query;
        const result = await userManagementService.getUsers({ page, limit, search, role, status });
        
        return res.status(200).json({
            status: "Success",
            data: result
        });
    } catch (error) {
        console.error("Get Users Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to retrieve users list.",
            error: error.message
        });
    }
}

/**
 * GET /api/admin/users/:id
 * Retrieve details for a specific user.
 */
async function getUserByIdController(req, res) {
    try {
        const userId = req.params.id;
        const user = await userManagementService.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({
                status: "Failed",
                message: "User account not found."
            });
        }

        return res.status(200).json({
            status: "Success",
            user
        });
    } catch (error) {
        console.error("Get User Details Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to retrieve user details.",
            error: error.message
        });
    }
}

/**
 * PATCH /api/admin/users/:id/suspend
 * Suspend user access. Prevents admin self-lockout.
 */
async function suspendUserController(req, res) {
    try {
        const targetUserId = req.params.id;
        const adminUserId = req.user ? (req.user.userId || req.user.id) : null;

        // Security Guard: Prevent admin self-suspension
        if (adminUserId && adminUserId.toString() === targetUserId.toString()) {
            return res.status(400).json({
                status: "Failed",
                message: "Security violation: You cannot suspend your own admin account."
            });
        }

        const user = await userManagementService.updateUserStatus(targetUserId, "suspended");
        
        if (!user) {
            return res.status(404).json({
                status: "Failed",
                message: "User account not found."
            });
        }

        return res.status(200).json({
            status: "Success",
            message: "User account suspended successfully.",
            user
        });
    } catch (error) {
        console.error("Suspend User Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to suspend user account.",
            error: error.message
        });
    }
}

/**
 * PATCH /api/admin/users/:id/activate
 * Activate a suspended user account.
 */
async function activateUserController(req, res) {
    try {
        const targetUserId = req.params.id;
        const user = await userManagementService.updateUserStatus(targetUserId, "active");
        
        if (!user) {
            return res.status(404).json({
                status: "Failed",
                message: "User account not found."
            });
        }

        return res.status(200).json({
            status: "Success",
            message: "User account activated successfully.",
            user
        });
    } catch (error) {
        console.error("Activate User Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to activate user account.",
            error: error.message
        });
    }
}

/**
 * DELETE /api/admin/users/:id
 * Delete a user account. Prevents admin self-deletion.
 */
async function deleteUserController(req, res) {
    try {
        const targetUserId = req.params.id;
        const adminUserId = req.user ? (req.user.userId || req.user.id) : null;

        // Security Guard: Prevent admin self-deletion
        if (adminUserId && adminUserId.toString() === targetUserId.toString()) {
            return res.status(400).json({
                status: "Failed",
                message: "Security violation: You cannot delete your own admin account."
            });
        }

        const isDeleted = await userManagementService.deleteUser(targetUserId);
        
        if (!isDeleted) {
            return res.status(404).json({
                status: "Failed",
                message: "User account not found or already deleted."
            });
        }

        return res.status(200).json({
            status: "Success",
            message: "User account and all associated data deleted successfully."
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Failed to delete user account.",
            error: error.message
        });
    }
}

module.exports = {
    getUsersController,
    getUserByIdController,
    suspendUserController,
    activateUserController,
    deleteUserController
};

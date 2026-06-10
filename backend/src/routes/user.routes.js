const express = require('express');
const userController = require("../controllers/user.controller");
const authmiddleware = require("../middlewares/auth.middleware")

const router = express.Router();

router.post("/register",userController.userRegisterController);
router.post("/login",userController.userloginController);
router.post("/logout",userController.userLogoutController);
router.get("/get-me",authmiddleware.authUser,userController.getUserController)

// Profile Management Routes
router.put("/profile", authmiddleware.authUser, userController.updateUserProfile);
router.put("/profile/change-password", authmiddleware.authUser, userController.changePassword);
router.get("/profile/login-history", authmiddleware.authUser, userController.getLoginHistory);
router.get("/profile/active-sessions", authmiddleware.authUser, userController.getActiveSessions);
router.post("/profile/active-sessions/revoke", authmiddleware.authUser, userController.revokeSession);

// UI Theme Preference Route
router.put("/profile/ui-theme", authmiddleware.authUser, userController.updateUITheme);

module.exports = router
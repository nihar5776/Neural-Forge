const express = require("express");
const Router = express.Router();
const { upload } = require("../middlewares/file.middleware");
const { tailorResume } = require("../controllers/tailor.controller");
const authMiddleware = require("../middlewares/auth.middleware");

Router.post("/", upload.single("resume"), authMiddleware.authUser, tailorResume);

module.exports = Router;

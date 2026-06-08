const express=require("express");
const Router=express.Router();
const { upload } = require("../middlewares/file.middleware");
const {resumeUpload}=require("../controllers/resumeUpload.controller");
const authMiddleware=require("../middlewares/auth.middleware");
Router.post("/",upload.single("resume"),authMiddleware.authUser,resumeUpload);

module.exports=Router;
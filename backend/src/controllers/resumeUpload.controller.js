const { resumeModel } = require("../models/resume.model");
const userModel = require("../models/user.models");
const pdfParse = require("pdf-parse");

async function resumeUpload(req, res) {
  try {
    const resume = req.file;
    if (!resume) {
      return res.status(400).json({
        message: "Resume file is required"
      });
    }

    let pdfData;
    try {
      pdfData = await pdfParse(resume.buffer);
    } catch (parseError) {
      console.error("PDF parse failed during upload:", parseError);
      return res.status(400).json({
        status: "Failed",
        message: "Failed to parse PDF resume. Please ensure the file is a valid PDF."
      });
    }

    const userId = req.user.userId || req.user.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "User account no longer exists in the database."
      });
    }

    const response = await resumeModel.create({
      resume: pdfData.text,
      filename: resume.originalname || "Resume.pdf",
      user: user._id
    });

    res.status(201).json({
      status: "Successful",
      response
    });
  } catch (err) {
    console.error("Error in resumeUpload:", err);
    res.status(500).json({
      status: "Failed",
      message: "An error occurred while uploading the resume.",
      error: err.message
    });
  }
}

async function getUserResumes(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    // Exclude the heavy parsed text field when listing resumes for UI dropdowns
    const resumes = await resumeModel.find({ user: userId }).select("-resume").sort({ createdAt: -1 });
    res.status(200).json({
      status: "Successful",
      resumes
    });
  } catch (err) {
    console.error("Error in getUserResumes:", err);
    res.status(500).json({
      status: "Failed",
      message: "An error occurred while fetching resumes.",
      error: err.message
    });
  }
}

async function deleteUserResume(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const resumeId = req.params.id;
    const result = await resumeModel.findOneAndDelete({ _id: resumeId, user: userId });
    if (!result) {
      return res.status(404).json({
        status: "Failed",
        message: "Resume not found or unauthorized."
      });
    }
    res.status(200).json({
      status: "Successful",
      message: "Resume deleted successfully."
    });
  } catch (err) {
    console.error("Error in deleteUserResume:", err);
    res.status(500).json({
      status: "Failed",
      message: "An error occurred while deleting the resume.",
      error: err.message
    });
  }
}

async function renameUserResume(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const resumeId = req.params.id;
    const { newName } = req.body;

    if (!newName || typeof newName !== 'string' || newName.trim() === '') {
      return res.status(400).json({ status: "Failed", message: "A valid new name is required." });
    }

    const cleanName = newName.trim();

    // Enforce uniqueness
    let finalFilename = cleanName;
    let existing = await resumeModel.findOne({ user: userId, filename: finalFilename, _id: { $ne: resumeId } });
    let counter = 1;
    
    while (existing) {
      finalFilename = `${cleanName}_${counter}`;
      existing = await resumeModel.findOne({ user: userId, filename: finalFilename, _id: { $ne: resumeId } });
      counter++;
    }

    const updatedResume = await resumeModel.findOneAndUpdate(
      { _id: resumeId, user: userId },
      { filename: finalFilename },
      { new: true }
    );

    if (!updatedResume) {
      return res.status(404).json({ status: "Failed", message: "Resume not found or unauthorized." });
    }

    res.status(200).json({
      status: "Successful",
      message: "Resume renamed successfully.",
      filename: updatedResume.filename
    });
  } catch (err) {
    console.error("Error in renameUserResume:", err);
    res.status(500).json({ status: "Failed", message: "An error occurred while renaming the resume.", error: err.message });
  }
}

module.exports = {
  resumeUpload,
  getUserResumes,
  deleteUserResume,
  renameUserResume
};
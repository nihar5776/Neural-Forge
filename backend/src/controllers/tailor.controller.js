const pdfParse = require('pdf-parse');
const aiService = require("../services/ai.services");
const { resumeModel } = require("../models/resume.model");

async function tailorResume(req, res) {
  try {
    const { jobDescription, resumeId } = req.body;
    const userId = req.user ? (req.user.userId || req.user.id) : null;
    let resumeText = "";

    if (!jobDescription) {
        return res.status(400).json({ status: "Failed", message: "Job description is required" });
    }

    if (resumeId) {
      const storedResume = await resumeModel.findById(resumeId);
      if (!storedResume || storedResume.user.toString() !== userId.toString()) {
        return res.status(404).json({
          status: "Failed",
          message: "Selected resume not found or unauthorized."
        });
      }
      resumeText = storedResume.resume;
    } else {
      const resume = req.file;
      if (!resume) {
        return res.status(400).json({
          message: "Resume file or resumeId is required"
        });
      }
      let pdfData;
      try {
        pdfData = await pdfParse(resume.buffer);
        resumeText = pdfData.text;
      } catch (parseError) {
        console.error("PDF Parse Error:", parseError);
        return res.status(400).json({
          status: "Failed",
          message: "Failed to parse PDF resume. Please ensure the file is a valid, unencrypted PDF document."
        });
      }
    }

    let response;
    try {
      response = await aiService.generateTailoredResume({
        resumeText,
        jobDescription
      });
    } catch (aiError) {
      console.error("AI Generation Error:", aiError);
      return res.status(500).json({
        status: "Failed",
        message: "Failed to generate tailored resume. " + (aiError.message || "")
      });
    }

    res.status(200).json({
      status: "Successful",
      response
    });
  } catch (err) {
    console.error("Internal Server Error in tailorResume:", err);
    res.status(500).json({
      status: "Failed",
      message: "An unexpected error occurred while tailoring the resume.",
      error: err.message
    });
  }
}

module.exports = {
  tailorResume
};

const pdfParse = require('pdf-parse');
const path = require('path'); 
const upload = require("../middlewares/file.middleware").upload
const aiService = require("../services/ai.services")
const interviewReportModel = require("../models/interviewReportModel")
const { resumeModel } = require("../models/resume.model")

async function generateUserInterviewReport(req, res) {
  try {
    const { selfDescription, jobDescription, resumeId } = req.body;
    const userId = req.user ? (req.user.userId || req.user.id) : null;
    let resumeText = "";

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

      // Save the uploaded resume to the database permanently
      try {
        await resumeModel.create({
          resume: resumeText,
          filename: resume.originalname || "Resume.pdf",
          user: userId
        });
      } catch (saveError) {
        console.error("Failed to automatically save uploaded resume to database:", saveError);
      }
    }

    let response;
    try {
      response = await aiService.generateInterviewReport({
        resume: resumeText,
        jobDescription: jobDescription || "General Profile Assessment",
        selfDescription: selfDescription || ""
      });
    } catch (aiError) {
      console.error("AI Generation Error:", aiError);
      return res.status(500).json({
        status: "Failed",
        message: "Failed to generate AI analysis report. " + (aiError.message || "")
      });
    }

    const savedReport = await interviewReportModel.create({
      jobDescription: jobDescription || "General Profile Assessment",
      resume: resumeText,
      selfDescription: selfDescription || "",
      matchScore: response.matchScore,
      technicalQuestions: response.technicalQuestions,
      behavioralQuestions: response.behavioralQuestions,
      skillGaps: response.skillGaps,
      preparationPlan: response.preparationPlan,
      user: userId,
      title: response.title || "Career Profile Assessment"
    });

    res.status(201).json({
      status: "Successful",
      response: savedReport
    });
  } catch (err) {
    console.error("Internal Server Error in generateUserInterviewReport:", err);
    res.status(500).json({
      status: "Failed",
      message: "An unexpected error occurred while analyzing the resume.",
      error: err.message
    });
  }
}

async function getUserInterviewReportsHistory(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const reports = await interviewReportModel.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      status: "Successful",
      reports
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: "Failed to fetch reports history",
      error: err.message
    });
  }
}

module.exports = {
  generateUserInterviewReport,
  getUserInterviewReportsHistory
}
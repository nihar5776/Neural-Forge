const aiService = require("../services/ai.services");
const { quizModel } = require("../models/quiz.model");
const userModel = require("../models/user.models");

async function generateQuizHandler(req, res) {
  try {
    const { mode, skills, jobTitle, numQuestions, difficulty } = req.body;

    if (!mode || (mode !== 'jd' && mode !== 'skills')) {
      return res.status(400).json({
        status: "Failed",
        message: "Quiz mode parameter ('jd' or 'skills') is required."
      });
    }

    if (mode === 'jd' && (!jobTitle || jobTitle.trim() === '')) {
      return res.status(400).json({
        status: "Failed",
        message: "jobTitle is required for 'jd' quiz mode."
      });
    }

    if (mode === 'skills' && (!skills || !Array.isArray(skills) || skills.length === 0)) {
      return res.status(400).json({
        status: "Failed",
        message: "skills array is required for 'skills' quiz mode."
      });
    }

    const userId = req.user ? (req.user.userId || req.user.id) : null;
    const quiz = await aiService.generateQuizAgentically({
      mode,
      skills,
      jobTitle,
      numQuestions: Number(numQuestions) || 5,
      difficulty: difficulty || 'Medium',
      userId
    });

    res.status(200).json({
      status: "Successful",
      quiz
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({
      status: "Failed",
      message: "Quiz generation failed. " + (error.message || "")
    });
  }
}

async function submitQuizHandler(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const { title, difficulty, score, totalQuestions, questions } = req.body;

    if (!title || score === undefined || !totalQuestions || !questions) {
      return res.status(400).json({
        status: "Failed",
        message: "Missing quiz submission details."
      });
    }

    const savedResult = await quizModel.create({
      user: userId,
      title,
      difficulty,
      score: Number(score),
      totalQuestions: Number(totalQuestions),
      questions
    });

    res.status(201).json({
      status: "Successful",
      response: savedResult
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to save quiz results. " + (error.message || "")
    });
  }
}

async function getQuizHistoryHandler(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const history = await quizModel.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      status: "Successful",
      history
    });
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to retrieve quiz history."
    });
  }
}

module.exports = {
  generateQuizHandler,
  submitQuizHandler,
  getQuizHistoryHandler
};

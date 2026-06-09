const mockInterviewModel = require("../models/mockInterview.model");
const { resumeModel } = require("../models/resume.model");
const {
  runPlannerAgent,
  runInterviewAgent,
  runEvaluatorAgent,
  runFeedbackAgent
} = require("../services/mockInterview.services");

/**
 * Start a mock interview session
 * Invokes Planner + Interview Agents to prepare custom details and generate ONLY Question 1.
 */
async function startInterview(req, res) {
  try {
    const { jobRole, resumeId } = req.body;
    const difficulty = req.body.difficulty || "medium";
    const userId = req.user.userId || req.user.id;

    if (!jobRole) {
      return res.status(400).json({
        status: "Failed",
        message: "jobRole is required."
      });
    }

    let resumeText = "";
    if (resumeId) {
      const resumeDoc = await resumeModel.findOne({ _id: resumeId, user: userId });
      if (!resumeDoc) {
        return res.status(404).json({
          status: "Failed",
          message: "Selected resume not found or unauthorized."
        });
      }
      resumeText = resumeDoc.resume;
    }

    console.log(`[Conversational Flow] Starting plan for ${jobRole} (${difficulty})...`);

    // 1. Run Planner Agent
    const plannerResult = await runPlannerAgent({
      jobRole,
      resumeText,
      difficulty,
      userId
    });

    console.log("[Conversational Flow] Planner finished. Focus areas:", plannerResult.focusAreas);

    // 2. Run Interview Agent to generate Question 1
    const firstQuestion = await runInterviewAgent({
      jobRole: plannerResult.jobRole,
      difficulty: plannerResult.interviewDifficulty,
      extractedDetails: plannerResult.extractedDetails,
      focusAreas: plannerResult.focusAreas,
      previousQuestions: [], // Empty history for Q1
      userId
    });

    console.log("[Conversational Flow] Generated Question 1:", firstQuestion.question);

    // 3. Create session in DB with only Question 1
    const questionsList = [{
      question: firstQuestion.question,
      category: firstQuestion.category,
      topic: firstQuestion.topic || "",
      userAnswer: "",
      score: null,
      feedback: "",
      idealAnswer: ""
    }];

    const session = await mockInterviewModel.create({
      user: userId,
      jobRole: plannerResult.jobRole,
      difficulty: plannerResult.interviewDifficulty,
      resumeId: resumeId || null,
      extractedDetails: plannerResult.extractedDetails,
      focusAreas: plannerResult.focusAreas,
      questions: questionsList,
      status: "initiated"
    });

    res.status(201).json({
      status: "Successful",
      interview: session
    });

  } catch (error) {
    console.error("Error starting mock interview:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to initialize mock interview. " + (error.message || "")
    });
  }
}

/**
 * Submit user answer (text or voice) for a question
 * Evaluates the answer immediately and dynamically generates the next question if rounds are not complete.
 */
async function submitAnswer(req, res) {
  try {
    const { id } = req.params;
    const { questionIndex, answerType, userAnswer } = req.body;
    const userId = req.user.userId || req.user.id;

    if (questionIndex === undefined || !answerType) {
      return res.status(400).json({
        status: "Failed",
        message: "questionIndex and answerType are required."
      });
    }

    const session = await mockInterviewModel.findOne({ _id: id, user: userId });
    if (!session) {
      return res.status(404).json({
        status: "Failed",
        message: "Mock interview session not found or unauthorized."
      });
    }

    const qIdx = parseInt(questionIndex, 10);
    if (qIdx < 0 || qIdx >= session.questions.length) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid questionIndex."
      });
    }

    // Ensure they are answering the latest generated question in sequential order
    if (qIdx !== session.questions.length - 1) {
      return res.status(400).json({
        status: "Failed",
        message: "You can only answer the current active question."
      });
    }

    const questionObj = session.questions[qIdx];

    console.log(`[Conversational Flow] Evaluating answer for Question ${qIdx + 1} (${answerType})...`);

    // 1. Evaluate response (passing file buffer if audio uploaded)
    const evaluation = await runEvaluatorAgent({
      question: questionObj.question,
      category: questionObj.category,
      userAnswer: answerType === "text" ? userAnswer : "",
      difficulty: session.difficulty,
      audioFile: answerType === "audio" ? req.file : null,
      userId
    });

    console.log(`[Conversational Flow] Grade: ${evaluation.score}. Spoken userAnswer: "${evaluation.userAnswer}"`);

    // Update current question fields in DB
    questionObj.userAnswer = evaluation.userAnswer;
    questionObj.score = evaluation.score;
    questionObj.feedback = evaluation.feedback;
    questionObj.idealAnswer = evaluation.idealAnswer;

    // Update difficulty adaptively based on score
    const currentDiff = session.difficulty;
    let newDiff = currentDiff;
    if (evaluation.score >= 80) {
      if (currentDiff === "easy") newDiff = "medium";
      else if (currentDiff === "medium") newDiff = "hard";
    } else if (evaluation.score < 60) {
      if (currentDiff === "hard") newDiff = "medium";
      else if (currentDiff === "medium") newDiff = "easy";
    }

    if (newDiff !== currentDiff) {
      console.log(`[Conversational Flow] Adapting difficulty: ${currentDiff} -> ${newDiff} (Score: ${evaluation.score})`);
      session.difficulty = newDiff;
    }

    let nextQuestion = null;
    const isLast = false; // Always false, as there is no limit to questions

    console.log(`[Conversational Flow] Generating dynamic Question ${qIdx + 2} based on history...`);

    const previousQuestions = session.questions.map(q => ({
      question: q.question,
      category: q.category,
      topic: q.topic,
      userAnswer: q.userAnswer
    }));

    // Run Interview Agent dynamically
    const nextQObj = await runInterviewAgent({
      jobRole: session.jobRole,
      difficulty: session.difficulty,
      extractedDetails: session.extractedDetails,
      focusAreas: session.focusAreas,
      previousQuestions,
      userId
    });

    console.log(`[Conversational Flow] Dynamic Question ${qIdx + 2} ready: "${nextQObj.question}"`);

    // Append new question to session DB list
    session.questions.push({
      question: nextQObj.question,
      category: nextQObj.category,
      topic: nextQObj.topic || "",
      userAnswer: "",
      score: null,
      feedback: "",
      idealAnswer: ""
    });

    nextQuestion = {
      question: nextQObj.question,
      category: nextQObj.category,
      topic: nextQObj.topic || ""
    };

    session.status = "in_progress";
    await session.save();

    res.status(200).json({
      status: "Successful",
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        idealAnswer: evaluation.idealAnswer,
        userAnswer: evaluation.userAnswer,
        nextQuestion,
        isLast
      }
    });

  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to evaluate response. " + (error.message || "")
    });
  }
}

/**
 * Finish mock interview session
 * Runs the Feedback Agent to generate consolidated dashboard performance reports.
 */
async function finishInterview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const session = await mockInterviewModel.findOne({ _id: id, user: userId });
    if (!session) {
      return res.status(404).json({
        status: "Failed",
        message: "Mock interview session not found or unauthorized."
      });
    }

    console.log("[Conversational Flow] Compiling final report...");

    // Filter out any trailing unanswered questions
    session.questions = session.questions.filter(q => q.userAnswer !== "" && q.score !== null);

    const transcript = session.questions.map(q => ({
      question: q.question,
      category: q.category,
      topic: q.topic,
      userAnswer: q.userAnswer,
      score: q.score,
      feedback: q.feedback
    }));

    // Run Feedback Agent
    const report = await runFeedbackAgent({
      jobRole: session.jobRole,
      difficulty: session.difficulty,
      questionsTranscript: transcript,
      userId
    });

    console.log("[Conversational Flow] Final report ready. Overall:", report.overallScore);

    session.overallScore = report.overallScore;
    session.technicalScore = report.technicalScore;
    session.communicationScore = report.communicationScore;
    session.strengths = report.strengths;
    session.weaknesses = report.weaknesses;
    session.lackingSkills = report.lackingSkills;
    session.recommendations = report.recommendations;
    session.status = "completed";

    await session.save();

    res.status(200).json({
      status: "Successful",
      interview: session
    });

  } catch (error) {
    console.error("Error finishing mock interview:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to generate final report. " + (error.message || "")
    });
  }
}

/**
 * Get user's completed interview history
 */
async function getHistory(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const history = await mockInterviewModel.find({ user: userId, status: "completed" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "Successful",
      history
    });
  } catch (error) {
    console.error("Error fetching mock interview history:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to fetch mock interview history. " + (error.message || "")
    });
  }
}

/**
 * Get details of a single interview session
 */
async function getInterviewDetail(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const session = await mockInterviewModel.findOne({ _id: id, user: userId });
    if (!session) {
      return res.status(404).json({
        status: "Failed",
        message: "Mock interview session not found or unauthorized."
      });
    }

    res.status(200).json({
      status: "Successful",
      interview: session
    });
  } catch (error) {
    console.error("Error fetching mock interview detail:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to fetch mock interview details. " + (error.message || "")
    });
  }
}

module.exports = {
  startInterview,
  submitAnswer,
  finishInterview,
  getHistory,
  getInterviewDetail
};

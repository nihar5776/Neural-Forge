const aiService = require("../services/ai.services");
const jobSearchModel = require("../models/jobSearch.model");

async function retrieveAgenticJobs(req, res) {
  try {
    const { jobRole, location } = req.body;
    
    if (!jobRole || jobRole.trim() === "") {
      return res.status(400).json({
        status: "Failed",
        message: "jobRole parameter is required."
      });
    }

    const userId = req.user ? (req.user.userId || req.user.id) : null;
    if (userId) {
      jobSearchModel.create({
        user: userId,
        jobRole: jobRole.trim(),
        location: location ? location.trim() : ""
      }).catch(err => {
        console.error("Failed to log job search to DB:", err.message);
      });
    }

    const result = await aiService.retrieveJobsAgentically({ jobRole, location, userId });
    
    res.status(200).json({
      status: "Successful",
      response: result
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Agentic job search failed.",
      error: error.message
    });
  }
}

module.exports = {
  retrieveAgenticJobs
};

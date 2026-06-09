require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const userModel = require('../models/user.models');
const mockInterviewModel = require('../models/mockInterview.model');
const {
  startInterview,
  submitAnswer,
  submitFollowUp,
  finishInterview
} = require('../controllers/mockInterview.controller');

// Mock Express Response
function mockResponse() {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
}

async function runTest() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.mongo_uri);
    console.log("Database Connected successfully.");

    // 1. Get or create a test user
    let user = await userModel.findOne({ email: 'mocktest@vidyaguide.com' });
    if (!user) {
      console.log("Creating test user...");
      user = await userModel.create({
        name: 'Test Candidate',
        email: 'mocktest@vidyaguide.com',
        password: 'Password123'
      });
    }
    const mockUser = { userId: user._id };

    console.log(`Using user: ${user.name} (${user.email})`);

    // Clean up any incomplete mock interviews for this test user
    await mockInterviewModel.deleteMany({ user: user._id });

    // 2. Test startInterview
    console.log("\n=================================");
    console.log("1. Testing startInterview controller...");
    console.log("=================================");
    const reqStart = {
      body: {
        jobRole: "Node.js Backend Developer",
        difficulty: "medium"
      },
      user: mockUser
    };
    const resStart = mockResponse();

    await startInterview(reqStart, resStart);

    if (resStart.statusCode !== 201) {
      throw new Error(`Failed to start interview: ${JSON.stringify(resStart.jsonData)}`);
    }

    const session = resStart.jsonData.interview;
    console.log("Mock Interview session created successfully!");
    console.log(`ID: ${session._id}`);
    console.log(`Role: ${session.jobRole}`);
    console.log(`Difficulty: ${session.difficulty}`);
    console.log(`Questions generated: ${session.questions.length}`);
    session.questions.forEach((q, i) => {
      console.log(`  Question ${i + 1} (${q.category}): "${q.question}"`);
    });

    if (session.questions.length === 0) {
      throw new Error("Questions list is empty!");
    }

    // 3. Test submitAnswer for Question 0
    console.log("\n=================================");
    console.log("2. Testing submitAnswer (Question 1) controller...");
    console.log("=================================");
    const firstQ = session.questions[0];
    const reqAnswer = {
      params: { id: session._id },
      body: {
        questionIndex: 0,
        userAnswer: "I use asynchronous Node.js APIs, async/await patterns, and cluster modules to build highly scalable REST API architectures."
      },
      user: mockUser
    };
    const resAnswer = mockResponse();

    await submitAnswer(reqAnswer, resAnswer);

    if (resAnswer.statusCode !== 200) {
      throw new Error(`Failed to submit answer: ${JSON.stringify(resAnswer.jsonData)}`);
    }

    const evalRes = resAnswer.jsonData.evaluation;
    console.log("Answer evaluated successfully!");
    console.log(`Score: ${evalRes.score}`);
    console.log(`Feedback: ${evalRes.feedback}`);
    console.log(`Ideal Answer: ${evalRes.idealAnswer}`);
    console.log(`Follow-up Question generated: "${evalRes.followUpQuestion}"`);

    // 4. Test submitFollowUp for Question 0
    console.log("\n=================================");
    console.log("3. Testing submitFollowUp (Question 1 follow-up) controller...");
    console.log("=================================");
    const reqFollowUp = {
      params: { id: session._id },
      body: {
        questionIndex: 0,
        followUpAnswer: "We can reduce latency by utilizing Redis caching, query indexing, and load balancing across nodes."
      },
      user: mockUser
    };
    const resFollowUp = mockResponse();

    await submitFollowUp(reqFollowUp, resFollowUp);

    if (resFollowUp.statusCode !== 200) {
      throw new Error(`Failed to submit follow-up: ${JSON.stringify(resFollowUp.jsonData)}`);
    }

    const followUpEval = resFollowUp.jsonData.evaluation;
    console.log("Follow-up answer evaluated successfully!");
    console.log(`Score: ${followUpEval.score}`);
    console.log(`Feedback: ${followUpEval.feedback}`);

    // Let's mock answers for other questions so we can generate a complete feedback report
    console.log("\nSimulating answers for remaining questions...");
    const dbSession = await mockInterviewModel.findById(session._id);
    for (let i = 1; i < dbSession.questions.length; i++) {
      dbSession.questions[i].userAnswer = "This is a placeholder simulation answer that covers general concepts.";
      dbSession.questions[i].score = 75;
      dbSession.questions[i].feedback = "Good attempt, covered basic details.";
      dbSession.questions[i].idealAnswer = "Benchmark answer details.";
      dbSession.questions[i].followUpQuestion = "What else would you add?";
      dbSession.questions[i].followUpAnswer = "Cashing and scaling features.";
      dbSession.questions[i].followUpScore = 80;
      dbSession.questions[i].followUpFeedback = "Solid followup points.";
    }
    await dbSession.save();

    // 5. Test finishInterview
    console.log("\n=================================");
    console.log("4. Testing finishInterview (Feedback report compiling) controller...");
    console.log("=================================");
    const reqFinish = {
      params: { id: session._id },
      user: mockUser
    };
    const resFinish = mockResponse();

    await finishInterview(reqFinish, resFinish);

    if (resFinish.statusCode !== 200) {
      throw new Error(`Failed to finish interview: ${JSON.stringify(resFinish.jsonData)}`);
    }

    const finalSession = resFinish.jsonData.interview;
    console.log("Interview Completed and Feedback compiled successfully!");
    console.log(`Overall Score: ${finalSession.overallScore}%`);
    console.log(`Technical Score: ${finalSession.technicalScore}%`);
    console.log(`Communication Score: ${finalSession.communicationScore}%`);
    console.log(`Strengths:`, finalSession.strengths);
    console.log(`Weaknesses:`, finalSession.weaknesses);
    console.log(`Recommendations:`, finalSession.recommendations);
    console.log(`Status: ${finalSession.status}`);

    console.log("\n=================================");
    console.log("ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!");
    console.log("=================================");

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

runTest();

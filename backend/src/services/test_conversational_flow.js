require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const userModel = require('../models/user.models');
const mockInterviewModel = require('../models/mockInterview.model');
const {
  startInterview,
  submitAnswer,
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

    let session = resStart.jsonData.interview;
    console.log("Mock Interview session created successfully!");
    console.log(`ID: ${session._id}`);
    console.log(`Role: ${session.jobRole}`);
    console.log(`Difficulty: ${session.difficulty}`);
    console.log(`Questions generated: ${session.questions.length}`);
    console.log(`Question 1 (${session.questions[0].category}): "${session.questions[0].question}"`);

    // 3. Test submitAnswer for Question 1
    console.log("\n=================================");
    console.log("2. Testing submitAnswer (Question 1) -> Generates Question 2");
    console.log("=================================");
    const reqAns1 = {
      params: { id: session._id },
      body: {
        questionIndex: 0,
        answerType: "text",
        userAnswer: "I use asynchronous Node.js APIs, async/await patterns, and cluster modules to build highly scalable REST API architectures."
      },
      user: mockUser
    };
    const resAns1 = mockResponse();

    await submitAnswer(reqAns1, resAns1);

    if (resAns1.statusCode !== 200) {
      throw new Error(`Failed to submit answer 1: ${JSON.stringify(resAns1.jsonData)}`);
    }

    let evalRes1 = resAns1.jsonData.evaluation;
    console.log("Question 1 evaluated successfully!");
    console.log(`Score: ${evalRes1.score}`);
    console.log(`Feedback: ${evalRes1.feedback}`);
    console.log(`Next Question generated: "${evalRes1.nextQuestion.question}" (${evalRes1.nextQuestion.category})`);

    // Retrieve updated session from DB to sync questions array
    let updatedSession = await mockInterviewModel.findById(session._id);
    console.log(`Questions array length: ${updatedSession.questions.length}`);
    console.log(`Adapted Session Difficulty: ${updatedSession.difficulty}`);

    // 4. Test submitAnswer for Question 2
    console.log("\n=================================");
    console.log("3. Testing submitAnswer (Question 2) -> Generates Question 3");
    console.log("=================================");
    const reqAns2 = {
      params: { id: session._id },
      body: {
        questionIndex: 1,
        answerType: "text",
        userAnswer: "For behavioral conflict, I use the STAR framework: Situation, Task, Action, Result. I stay calm, focus on details, and communicate openly with stakeholders."
      },
      user: mockUser
    };
    const resAns2 = mockResponse();

    await submitAnswer(reqAns2, resAns2);

    if (resAns2.statusCode !== 200) {
      throw new Error(`Failed to submit answer 2: ${JSON.stringify(resAns2.jsonData)}`);
    }

    let evalRes2 = resAns2.jsonData.evaluation;
    console.log("Question 2 evaluated successfully!");
    console.log(`Score: ${evalRes2.score}`);
    console.log(`Feedback: ${evalRes2.feedback}`);
    console.log(`Next Question generated: "${evalRes2.nextQuestion.question}" (${evalRes2.nextQuestion.category})`);

    // Retrieve updated session from DB to sync questions array
    updatedSession = await mockInterviewModel.findById(session._id);
    console.log(`Questions array length: ${updatedSession.questions.length}`);
    console.log(`Adapted Session Difficulty: ${updatedSession.difficulty}`);

    // 5. Test submitAnswer for Question 3
    console.log("\n=================================");
    console.log("4. Testing submitAnswer (Question 3) -> Last Question");
    console.log("=================================");
    const reqAns3 = {
      params: { id: session._id },
      body: {
        questionIndex: 2,
        answerType: "text",
        userAnswer: "To optimize MongoDB queries, I use indexing, analyze query execution plans using explain(), and avoid loading unnecessary fields by using projection."
      },
      user: mockUser
    };
    const resAns3 = mockResponse();

    await submitAnswer(reqAns3, resAns3);

    if (resAns3.statusCode !== 200) {
      throw new Error(`Failed to submit answer 3: ${JSON.stringify(resAns3.jsonData)}`);
    }

    let evalRes3 = resAns3.jsonData.evaluation;
    console.log("Question 3 evaluated successfully!");
    console.log(`Score: ${evalRes3.score}`);
    console.log(`Feedback: ${evalRes3.feedback}`);
    console.log(`Is Last: ${evalRes3.isLast}`);

    // 6. Test finishInterview
    console.log("\n=================================");
    console.log("5. Testing finishInterview (Feedback report compiling) controller...");
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
    console.log(`Lacking Skills:`, finalSession.lackingSkills);
    console.log(`Recommendations:`, finalSession.recommendations);
    console.log(`Status: ${finalSession.status}`);

    console.log("\n=================================");
    console.log("ALL CONVERSATIONAL BACKEND TESTS PASSED SUCCESSFULLY!");
    console.log("=================================");

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

runTest();

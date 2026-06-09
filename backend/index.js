require('dotenv').config();
const express = require("express")
const cors = require("cors")
const app = express()
const cookieParser = require("cookie-parser");

const userRouter = require("./src/routes/user.routes");
const interviewRouter = require("./src/routes/interview.routes");
const resumeUploadRouter = require("./src/routes/resumeUpload.routes");
const jobRouter = require("./src/routes/job.routes");
const quizRouter = require("./src/routes/quiz.routes");
const mockInterviewRouter = require("./src/routes/mockInterview.routes");
const tailorRouter = require("./src/routes/tailor.routes");

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());



app.use("/api/auth/",userRouter);
app.use("/api/interview/",interviewRouter);
app.use("/api/resumeUpload/",resumeUploadRouter);
app.use("/api/jobs/",jobRouter);
app.use("/api/quiz/", quizRouter);
app.use("/api/mock-interview/", mockInterviewRouter);
app.use("/api/tailor/", tailorRouter);


module.exports = app;
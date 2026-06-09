const { z } = require("zod");
const aiClient = require("./aiClient");

// Zod schemas for structured responses
const plannerResponseSchema = z.object({
  jobRole: z.string(),
  resumeAvailable: z.boolean(),
  interviewDifficulty: z.enum(['easy', 'medium', 'hard']),
  extractedDetails: z.object({
    projects: z.array(z.string()),
    skills: z.array(z.string()),
    technologies: z.array(z.string())
  }),
  focusAreas: z.array(z.string())
});

const singleQuestionSchema = z.object({
  question: z.string(),
  category: z.enum(['technical', 'behavioral', 'resume-based']),
  topic: z.string()
});

const evaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  idealAnswer: z.string()
});

const finalFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  lackingSkills: z.array(z.string()),
  recommendations: z.array(z.string())
});

/**
 * 1. Planner Agent
 * Determines job role, resume availability, interview difficulty, and extracts details.
 */
async function runPlannerAgent({ jobRole, resumeText = '', difficulty, userId = null }) {
  try {
    const prompt = `
You are the Planner Agent of a Mock Interview system.
Your goal is to parse and determine:
1. Target Job Role: ${jobRole}
2. Resume availability: ${resumeText ? 'Yes' : 'No'}
3. Difficulty: ${difficulty}

If a resume is available, extract:
- Key Projects
- Core Skills
- Key Technologies

Then, outline 3-5 focus areas/topics for the interview (e.g. "React State Management", "Conflict Resolution", etc.).

Resume Content:
${resumeText || "No resume uploaded."}

Return ONLY valid JSON matching this schema:
{
  "jobRole": "string",
  "resumeAvailable": boolean,
  "interviewDifficulty": "easy" | "medium" | "hard",
  "extractedDetails": {
    "projects": ["string"],
    "skills": ["string"],
    "technologies": ["string"]
  },
  "focusAreas": ["string"]
}
`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: "user", content: prompt }],
      systemInstruction: "You are the Planner Agent of a Mock Interview system.",
      userId,
      feature: "Mock Interview Planner"
    });

    return plannerResponseSchema.parse(response);
  } catch (error) {
    console.error("Planner Agent Error:", error);
    throw error;
  }
}

/**
 * 2. Interview Agent (Dynamic / Sequential)
 * Generates the NEXT question dynamically based on interview progress and history.
 */
async function runInterviewAgent({ jobRole, difficulty, extractedDetails, focusAreas, previousQuestions = [], userId = null }) {
  try {
    const nextQuestionIndex = previousQuestions.length + 1;

    // Determine target category based on interview turn
    let targetCategory = "technical";
    const hasResume = extractedDetails && 
      ((extractedDetails.projects && extractedDetails.projects.length > 0) || 
       (extractedDetails.skills && extractedDetails.skills.length > 0) || 
       (extractedDetails.technologies && extractedDetails.technologies.length > 0));

    if (nextQuestionIndex === 2) {
      targetCategory = "behavioral";
    } else if (nextQuestionIndex === 3) {
      targetCategory = hasResume ? "resume-based" : "technical";
    }

    const resumeContext = hasResume ? `
The candidate's extracted profile:
- Projects: ${JSON.stringify(extractedDetails.projects)}
- Skills: ${JSON.stringify(extractedDetails.skills)}
- Technologies: ${JSON.stringify(extractedDetails.technologies)}
` : '';

    const prompt = `
You are the Interview Agent.
Your job is to generate exactly ONE interview question (Question #${nextQuestionIndex}) based on:
- Job Role: "${jobRole}"
- Difficulty: "${difficulty}"
- Planned Focus Areas: ${JSON.stringify(focusAreas)}
- Previous Question/Answer History: ${JSON.stringify(previousQuestions)}
${resumeContext}

Target Category: "${targetCategory}"

Target difficulty guidelines:
- Easy: tests basic definitions, syntax, simple concepts.
- Medium: tests practical tasks, coding scenarios, simple system design, conflict resolution.
- Hard: tests complex architecture, scaling, deep system troubleshooting, severe trade-offs.

Behavioral Question Guidelines:
- If Target Category is "behavioral", generate a standard, interpersonal/soft-skills behavioral question (e.g., conflict resolution, handling tight deadlines, coping with project changes, communicating with non-technical stakeholders, or dealing with mistakes).
- Do NOT make the behavioral question heavily technical or require deep system-design/coding problem solving. Keep it focused on human scenarios and collaboration, contextualized to the role (e.g. "Tell me about a time you had a difference of opinion with a team member. How did you resolve it and work together?").

Rule:
- Do NOT generate questions similar to or covering the exact same topics already present in the "Previous Question/Answer History".
- Make the question direct, specific, and realistic for a candidate applying for: "${jobRole}".

Return ONLY valid JSON matching this schema:
{
  "question": "string (the question text)",
  "category": "technical" | "behavioral" | "resume-based",
  "topic": "string (specific topic name, e.g. Event Loop, STAR Conflict, Random Forest Choice)"
}
`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: "user", content: prompt }],
      systemInstruction: "You are the Interview Agent of a Mock Interview system.",
      userId,
      feature: "Mock Interview Question Generation"
    });

    return singleQuestionSchema.parse(response);
  } catch (error) {
    console.error("Interview Agent Error:", error);
    throw error;
  }
}

/**
 * 3. Evaluator Agent
 * Transcribes voice answer (if audio uploaded) and evaluates the text against the question.
 */
async function runEvaluatorAgent({ question, category, userAnswer = '', difficulty, audioFile = null, userId = null }) {
  try {
    let finalAnswer = userAnswer;

    // Transcribe audio if uploaded
    if (audioFile && audioFile.buffer) {
      console.log("Transcribing audio answer via speech client...");
      try {
        const transcript = await aiClient.transcribeAudio(audioFile.buffer, audioFile.mimetype, userId, "Mock Interview Answer Audio Transcription");
        console.log(`Transcribed text: "${transcript}"`);
        finalAnswer = transcript || "No audible speech detected.";
      } catch (transcribeError) {
        console.error("Speech transcription failed:", transcribeError);
        finalAnswer = "[Transcription failed due to API limits or invalid audio format]";
      }
    }

    const prompt = `
You are the Evaluator Agent.
Evaluate the candidate's answer for the following question.

Question: "${question}"
Category: "${category}"
Interview Difficulty: "${difficulty}"
Candidate's Answer: "${finalAnswer}"

Grade the answer on a scale from 0 to 100.
Provide constructive feedback detailing:
- What was correct and answered well.
- What was missed or could be improved.
- Provide a clear, comprehensive Ideal Answer for the candidate's reference.

Return ONLY valid JSON matching this schema:
{
  "score": number (0-100),
  "feedback": "string (constructive feedback)",
  "idealAnswer": "string (perfect sample answer)"
}
`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: "user", content: prompt }],
      systemInstruction: "You are the Evaluator Agent of a Mock Interview system.",
      userId,
      feature: "Mock Interview Evaluator"
    });

    const validated = evaluationSchema.parse(response);

    return {
      score: validated.score,
      feedback: validated.feedback,
      idealAnswer: validated.idealAnswer,
      userAnswer: finalAnswer // Return transcript so UI knows what was parsed
    };
  } catch (error) {
    console.error("Evaluator Agent Error:", error);
    throw error;
  }
}

/**
 * 4. Feedback Agent
 * Consolidates all questions, answers, and evaluations into a final performance report.
 */
async function runFeedbackAgent({ jobRole, difficulty, questionsTranscript, userId = null }) {
  try {
    const prompt = `
You are the Feedback Agent.
Analyze the entire mock interview transcript and performance reports below to generate a final report.

Job Role: "${jobRole}"
Difficulty: "${difficulty}"

Transcript & Individual Evaluations:
${JSON.stringify(questionsTranscript, null, 2)}

Provide:
1. overallScore (0-100): Weighted average of all scores.
2. technicalScore (0-100): Evaluation of technical competency.
3. communicationScore (0-100): Evaluation of explanation clarity, style, and tone.
4. strengths: List of 3-5 specific strengths identified.
5. weaknesses: List of 3-5 specific weaknesses/gaps identified.
6. lackingSkills: List of 3-5 specific technical or core skills/concepts the candidate is lacking (e.g. "React Context API", "STAR behavioral structure", "Promise error handling").
7. recommendations: List of 3-5 concrete study tasks or actionable items for improvement.

Return ONLY valid JSON matching this schema:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "lackingSkills": ["string"],
  "recommendations": ["string"]
}
`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: "user", content: prompt }],
      systemInstruction: "You are the Feedback Agent of a Mock Interview system.",
      userId,
      feature: "Mock Interview Feedback"
    });

    return finalFeedbackSchema.parse(response);
  } catch (error) {
    console.error("Feedback Agent Error:", error);
    throw error;
  }
}

module.exports = {
  runPlannerAgent,
  runInterviewAgent,
  runEvaluatorAgent,
  runFeedbackAgent
};

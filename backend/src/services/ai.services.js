const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");


console.log(
  "API KEY LOADED:",
  !!process.env.GOOGLE_GEMINI_API_KEY
);

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY
});

const interviewReportSchema = z.object({
  title: z.string(),
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string()
    })
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string()
    })
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"])
    })
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
      resources: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          type: z.enum(["youtube", "official"])
        })
      )
    })
  )
});
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription
}) {
  try {
    const prompt = `
You are an expert technical recruiter.

Analyze the candidate profile and job description.

Return ONLY valid JSON.

The JSON MUST EXACTLY follow this structure:

{
  "title": "string",
  "matchScore": 95,
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "string",
      "tasks": ["string"],
      "resources": [
        {
          "title": "string",
          "url": "string",
          "type": "youtube"
        }
      ]
    }
  ]
}
Requirements:
- matchScore between 0 and 100
- 5-7 technical questions
- 3-5 behavioral questions
- realistic skill gaps
- preparationPlan must have a minimum of 7 days, but scale it dynamically based on the complexity and severity of the identified skillGaps (extending up to 14, 21, or 30+ days if severe gaps are found).
- For each day in the preparationPlan, you MUST include a 'resources' array containing 1-2 highly specific learning resources. Each resource should have a descriptive title, a valid URL (use real search URLs like 'https://www.youtube.com/results?search_query=...' or official documentation URLs like 'https://react.dev/'), and a 'type' of either 'youtube' or 'official'.
- title should be the job title
Resume:
${resume}
Self Description:
${selfDescription}
Job Description:
${jobDescription}
`;

    const response = await generateContentWithFallback({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    console.log("RAW RESPONSE:");
    console.log(response.text);

    const parsedResponse = JSON.parse(response.text);
    const validatedResponse =
      interviewReportSchema.parse(parsedResponse);

    console.log(
      "Structured Output Success:",
      validatedResponse
    );
    return validatedResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    if (error instanceof z.ZodError) {
      console.error("Schema Validation Error:");
      console.error(error.issues);
    }
    throw error;
  }
}

const jobSearchResultSchema = z.object({
  jobRole: z.string(),
  jobs: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      location: z.string(),
      link: z.string(),
      platform: z.enum(["LinkedIn", "Unstop", "Other"])
    })
  )
});

function cleanContentForStableModel(content) {
  if (!content) return content;
  if (typeof content === "string") return content;
  if (content.parts && Array.isArray(content.parts)) {
    const cleanParts = content.parts.map(part => {
      const newPart = {};
      if (part.text !== undefined) newPart.text = part.text;
      if (part.functionCall !== undefined) newPart.functionCall = part.functionCall;
      if (part.functionResponse !== undefined) newPart.functionResponse = part.functionResponse;
      return newPart;
    }).filter(part => Object.keys(part).length > 0);
    return { ...content, parts: cleanParts };
  }
  return content;
}

let useFallbackDirectly = false;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(fn, retries = 5, delay = 8000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isDailyLimit = error.message && (
        error.message.includes("PerDay") || 
        error.message.includes("limit: 20") ||
        error.message.includes("limit: 0") ||
        error.message.includes("daily")
      );

      if (isDailyLimit) {
        console.warn("Daily request limit reached. Redirecting immediately to fallback model.");
        useFallbackDirectly = true;
        throw error;
      }

      const isRetryable = error.status === 429 || error.status === 503 ||
        (error.message && (
          error.message.includes("429") || 
          error.message.includes("503") || 
          error.message.includes("quota") ||
          error.message.includes("RESOURCE_EXHAUSTED") ||
          error.message.includes("high demand") ||
          error.message.includes("UNAVAILABLE")
        ));

      if (isRetryable && i < retries - 1) {
        console.warn(`Retryable error hit (${error.status || 'unknown status'}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await sleep(delay);
        delay *= 2; // exponential backoff
        continue;
      }
      throw error;
    }
  }
}

async function generateContentWithFallback({ model = "gemini-3-flash-preview", contents, config }) {
  const makeCall = async (targetModel) => {
    return await ai.models.generateContent({ 
      model: targetModel, 
      contents: targetModel === "gemini-2.5-flash" ? cleanContentForStableModel(contents) : contents, 
      config 
    });
  };

  const selectedModel = useFallbackDirectly ? "gemini-2.5-flash" : model;

  try {
    return await generateWithRetry(() => makeCall(selectedModel), 5, 8000);
  } catch (error) {
    if (selectedModel !== "gemini-2.5-flash") {
      console.warn(`${selectedModel} failed, falling back to gemini-2.5-flash. Error:`, error.message);
      try {
        return await generateWithRetry(() => makeCall("gemini-2.5-flash"), 5, 8000);
      } catch (fallbackError) {
        console.error("Fallback to gemini-2.5-flash also failed:", fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
}

async function retrieveJobsAgentically({ jobRole }) {
  const jobService = require("./job.service");

  try {
    const prompt = `Find real job applications for: "${jobRole}". Use the fetchJobPostings tool to search LinkedIn and Unstop first.`;

    const config = {
      systemInstruction: "You are a career assistant Agent. You must search for jobs using the fetchJobPostings tool. Always invoke the tool first to fetch jobs, then format the fetched jobs as a clean JSON list.",
      tools: [
        {
          functionDeclarations: [
            {
              name: "fetchJobPostings",
              description: "Retrieves job postings from LinkedIn and Unstop for a specific job title.",
              parameters: {
                type: "OBJECT",
                properties: {
                  jobRole: { type: "STRING", description: "The job title to search (e.g. 'Node.js Developer')" }
                },
                required: ["jobRole"]
              }
            }
          ]
        }
      ]
    };

    // 1. Initial call to trigger tool use
    let response = await generateContentWithFallback({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: config
    });

    console.log("Gemini Agent Call 1 finished. Function Calls:", response.functionCalls);

    let finalOutput = "";

    // 2. Check for tool usage
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      
      if (call.name === "fetchJobPostings") {
        console.log("Agent executing tool: fetchJobPostings for", call.args.jobRole);
        
        // Execute the scraper tool
        const jobsFound = await jobService.fetchJobPostings(call.args.jobRole);
        console.log(`Tool retrieved ${jobsFound.length} jobs.`);

        // Send tool response to Gemini
        const secondResponse = await generateContentWithFallback({
          model: "gemini-3-flash-preview",
          contents: [
            { role: "user", parts: [{ text: prompt }] },
            response.candidates[0].content,
            { role: "user", parts: [{ functionResponse: { name: call.name, response: { jobs: jobsFound } } }] }
          ],
          config: {
            responseMimeType: "application/json",
            systemInstruction: `You are a career advisor agent. Analyze the jobs array supplied in the function response.
Filter out any job listings that are completely unrelated to the requested role: "${jobRole}".
Be reasonably flexible: keep titles like 'Full Stack Developer', 'Frontend Engineer', or 'Software Engineer' for a 'React Developer' request if they align with that track, but discard completely different roles (like 'Sales Manager', 'HR Recruiter', or 'AI Specialist' unless it specifically requires React).
Format the relevant jobs into a valid JSON object matching this schema:
{
  "jobRole": "${jobRole}",
  "jobs": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "link": "string",
      "platform": "LinkedIn" | "Unstop" | "Other"
    }
  ]
}`
          }
        });

        finalOutput = secondResponse.text;
      }
    } else {
      // Model returned text directly instead of function calling (e.g., if it didn't use the tool)
      console.log("Model did not request function calling. Running manual fallback.");
      const jobsFound = await jobService.fetchJobPostings(jobRole);
      
      const formatResponse = await generateContentWithFallback({
        model: "gemini-3-flash-preview",
        contents: `Format these jobs into the target JSON structure: ${JSON.stringify(jobsFound)}`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: `You are a career advisor agent. Parse and filter the job listings list.
Filter out any job listings that are completely unrelated to the requested role: "${jobRole}".
Format the relevant jobs into a valid JSON object matching this schema:
{
  "jobRole": "${jobRole}",
  "jobs": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "link": "string",
      "platform": "LinkedIn" | "Unstop" | "Other"
    }
  ]
}`
        }
      });
      finalOutput = formatResponse.text;
    }

    console.log("Gemini Agent final response:", finalOutput);
    const parsed = JSON.parse(finalOutput);
    const validated = jobSearchResultSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Agentic Job Search Error, falling back to raw scraped results:", error);
    try {
      const jobService = require("./job.service");
      const rawJobs = await jobService.fetchJobPostings(jobRole);
      return {
        jobRole,
        jobs: rawJobs
      };
    } catch (fallbackError) {
      console.error("Unstop / LinkedIn scrape fallback failed:", fallbackError);
      if (error instanceof z.ZodError) {
        console.error("Schema Validation Error:", error.issues);
      }
      throw error;
    }
  }
}

const aiQuizSchema = z.object({
  title: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.string(),
      explanation: z.string()
    })
  )
});

async function generateQuizAgentically({ mode, skills, jobTitle, numQuestions, difficulty }) {
  try {
    const scope = mode === 'jd' 
      ? `Job Description / Title: "${jobTitle}"`
      : `Target Skills: "${skills.join(', ')}"`;

    const prompt = `
You are an expert technical interviewer.

Generate a multiple-choice quiz based on:
${scope}

Difficulty Level: ${difficulty}
Number of Questions: ${numQuestions}

Return ONLY valid JSON matching this schema:
{
  "title": "string (descriptive title of the quiz)",
  "questions": [
    {
      "question": "string (the question text)",
      "options": [
        "string (Option A)",
        "string (Option B)",
        "string (Option C)",
        "string (Option D)"
      ],
      "correctAnswer": "string (MUST EXACTLY match one of the four options above)",
      "explanation": "string (detailed explanation of why this option is correct)"
    }
  ]
}

Requirements:
- Generate exactly ${numQuestions} questions.
- Every question must have exactly 4 choices in the 'options' array.
- The 'correctAnswer' must be a exact string match of one of the options.
- Target difficulty: ${difficulty}. Easy should test basic definitions/use-cases; Medium should test practical coding/scenario-based tasks; Hard should test deep architecture, troubleshooting, and edge cases.
- Do NOT generate unrelated or static generic trivia questions. Make them highly dynamic and specific to the requested scope: ${scope}.
`;

    const response = await generateContentWithFallback({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    console.log("Quiz Raw AI Response:", response.text);
    const parsed = JSON.parse(response.text);
    const validated = aiQuizSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Quiz Generation AI Error:", error);
    if (error instanceof z.ZodError) {
      console.error("Zod Schema Validation Error in Quiz:", error.issues);
    }
    throw error;
  }
}

const tailoredResumeSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional()
  }),
  summary: z.string(),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      duration: z.string(),
      responsibilities: z.array(z.string())
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string()
    })
  ),
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      link: z.string().optional()
    })
  ).optional(),
  atsAnalysis: z.object({
    matchScore: z.number().min(0).max(100),
    matchingSkills: z.array(z.string()),
    missingSkills: z.array(z.string()),
    keywordMatchAnalysis: z.string(),
    suggestionsForImprovement: z.array(z.string())
  })
});

async function generateTailoredResume({ resumeText, jobDescription }) {
  try {
    const prompt = `
You are an expert ATS (Applicant Tracking System) optimizer and professional resume writer.
Your task is to tailor the provided Resume to perfectly align with the provided Job Description.

CRITICAL RULES:
1. NEVER invent, fabricate, or hallucinate any experience, projects, education, certifications, or skills that the candidate does not possess according to their original resume.
2. Optimize bullet points to emphasize relevant achievements that match the Job Description requirements.
3. Quantify achievements where possible if the original resume implies them.
4. Naturally weave in keywords from the Job Description into the summary and experience bullet points.
5. Create a professional, concise summary that highlights alignment with the target role.
6. Provide an ATS Analysis section detailing the match score, matching skills, missing skills, and actionable suggestions for improvement.

The JSON MUST EXACTLY follow this structure:
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string"
  },
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "responsibilities": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
    }
  ],
  "skills": ["string"],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string"
    }
  ],
  "atsAnalysis": {
    "matchScore": 95,
    "matchingSkills": ["string"],
    "missingSkills": ["string"],
    "keywordMatchAnalysis": "string",
    "suggestionsForImprovement": ["string"]
  }
}

Return ONLY valid JSON matching this schema exactly.

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const response = await generateContentWithFallback({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    console.log("Tailored Resume Raw AI Response:", response.text);
    const parsed = JSON.parse(response.text);
    const validated = tailoredResumeSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Resume Tailoring AI Error:", error);
    if (error instanceof z.ZodError) {
      console.error("Zod Schema Validation Error in Tailoring:", error.issues);
    }
    throw error;
  }
}

module.exports = {
  generateInterviewReport,
  retrieveJobsAgentically,
  generateQuizAgentically,
  generateTailoredResume
};
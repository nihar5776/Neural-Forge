const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { logAiRequest } = require("./aiLogger");
const axios = require("axios");

console.log(
  "API KEY LOADED:",
  !!process.env.GOOGLE_GEMINI_API_KEY
);

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY
});

/**
 * Robustly parses an AI response string as JSON.
 * Handles:
 *   1. Markdown code fences: ```json ... ``` or ``` ... ```
 *   2. Truncated responses: extracts the longest valid JSON object/array
 *      using bracket matching so a cut-off at token limit doesn't crash.
 *   3. Leading/trailing whitespace or stray text around valid JSON.
 */
function safeParseJSON(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('AI returned an empty or non-string response.');
  }

  // Step 1: Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Step 2: Try direct parse first (fastest path)
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Fall through to bracket-matching extraction
  }

  // Step 3: Bracket-matching extraction for truncated responses
  // Find the first '{' or '[' and walk forward counting depth.
  // The longest valid JSON object/array found is returned.
  const startIdx = cleaned.search(/[{[]/);
  if (startIdx === -1) {
    throw new SyntaxError(`No JSON object or array found in AI response. Preview: ${cleaned.substring(0, 200)}`);
  }

  const openChar = cleaned[startIdx];
  const closeChar = openChar === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escape = false;
  let lastValidEnd = -1;

  for (let i = startIdx; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) { lastValidEnd = i; break; }
    }
  }

  if (lastValidEnd !== -1) {
    const candidate = cleaned.substring(startIdx, lastValidEnd + 1);
    try {
      const result = JSON.parse(candidate);
      console.warn(`[safeParseJSON] Recovered JSON from truncated response (extracted ${candidate.length} of ${cleaned.length} chars).`);
      return result;
    } catch (e) {
      throw new SyntaxError(`Bracket-matched JSON extraction failed: ${e.message}. Preview: ${candidate.substring(0, 300)}`);
    }
  }

  throw new SyntaxError(`Could not extract valid JSON from AI response. Preview: ${cleaned.substring(0, 300)}`);
}

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
  jobDescription,
  userId = null
}) {
  try {
    // Inject a random seed so identical inputs still vary in question selection
    const sessionSeed = Math.random().toString(36).substring(2, 10).toUpperCase();
    const prompt = `
You are a strict, senior technical recruiter conducting an honest, unbiased evaluation.
Session seed (use this to randomise your question selection): ${sessionSeed}

Your MOST IMPORTANT task is to provide an HONEST matchScore. Follow this rubric rigorously:

== MATCH SCORE RUBRIC ==
- 0-20:   Resume is entirely unrelated to the job (e.g. a chef applying for a software engineer role).
- 21-40:  Resume is from a different field; only 1-2 transferable soft skills match.
- 41-55:  Resume is in a related domain but candidate lacks most required hard skills.
- 56-70:  Partial match — candidate has some relevant skills but several key requirements are missing.
- 71-85:  Good match — candidate meets most requirements with a few skill gaps.
- 86-95:  Strong match — nearly all requirements are met with minor gaps.
- 96-100: Perfect or near-perfect alignment — all hard skills, experience level, and domain match.

CRITICAL RULES FOR matchScore:
- If the resume domain and job description domain are UNRELATED, the score MUST be 25 or below.
- Do NOT award a score above 55 unless the resume explicitly demonstrates at least 50% of the specific technical skills listed in the job description.
- Do NOT round up or be generous. Be honest like a senior recruiter who must justify this score to their hiring manager.

Analyze the candidate profile and job description.

Return ONLY valid JSON.

The JSON MUST EXACTLY follow this structure:

{
  "title": "string",
  "matchScore": 0,
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
- matchScore MUST follow the rubric above exactly. Be strict and honest.
- 5-7 technical questions that are UNIQUE to this specific job description and candidate — do NOT use generic questions.
- 3-5 behavioral questions.
- Identify all realistic skill gaps honestly based on the actual job description requirements.
- preparationPlan MUST have between 7 and 14 days. Scale within this range based on skill gap severity. DO NOT exceed 14 days.
- Keep each day's tasks concise (2-3 tasks max, 1 resource max) to stay within response limits.
- title should be the job title from the job description.
- Generate FRESH, VARIED questions each time — do not use common boilerplate questions.
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
      },
      userId,
      feature: "Resume Analysis"
    });

    console.log("RAW RESPONSE (first 500 chars):");
    console.log((response.text || '').substring(0, 500));

    const parsedResponse = safeParseJSON(response.text);
    // Normalize severity to lowercase — AI sometimes returns "High"/"Medium"/"Low"
    if (Array.isArray(parsedResponse.skillGaps)) {
      parsedResponse.skillGaps = parsedResponse.skillGaps.map(gap => ({
        ...gap,
        severity: typeof gap.severity === 'string' ? gap.severity.toLowerCase() : gap.severity
      }));
    }
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
      platform: z.enum(["LinkedIn", "Unstop", "Shine", "Other"])
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
let useGroqDirectly = false;
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

function convertGeminiToGroqMessages(contents, systemInstruction) {
  const messages = [];
  
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  
  if (typeof contents === "string") {
    messages.push({ role: "user", content: contents });
  } else if (Array.isArray(contents)) {
    for (const item of contents) {
      let role = "user";
      if (item.role === "model" || item.role === "assistant") {
        role = "assistant";
      } else if (item.role === "system") {
        role = "system";
      }
      
      let textContent = "";
      if (item.parts && Array.isArray(item.parts)) {
        for (const part of item.parts) {
          if (part.text) {
            textContent += part.text;
          } else if (part.functionResponse) {
            textContent += JSON.stringify(part.functionResponse);
          }
        }
      } else if (typeof item === "string") {
        textContent = item;
      }
      
      messages.push({ role, content: textContent });
    }
  }
  
  return messages;
}

async function callGroqCompletion(contents, config) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined");
  }
  
  const systemInstruction = config && config.systemInstruction;
  const messages = convertGeminiToGroqMessages(contents, systemInstruction);
  
  console.log("Routing structured completion fallback to Groq...");
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: messages,
      response_format: config && config.responseMimeType === "application/json" ? { type: "json_object" } : undefined
    },
    {
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  
  return {
    text: response.data.choices[0].message.content,
    usageMetadata: {
      promptTokenCount: response.data.usage ? response.data.usage.prompt_tokens : 0,
      candidatesTokenCount: response.data.usage ? response.data.usage.completion_tokens : 0
    }
  };
}

async function generateContentWithFallback({ model = "gemini-3-flash-preview", contents, config, userId = null, feature = "AI Services" }) {
  const startTime = Date.now();
  let finalModelUsed = model;
  const hasGroq = !!process.env.GROQ_API_KEY;
  const maxRetries = hasGroq ? 1 : 5;
  const retryDelay = hasGroq ? 1000 : 8000;

  const makeCall = async (targetModel) => {
    finalModelUsed = targetModel;
    return await ai.models.generateContent({ 
      model: targetModel, 
      contents: targetModel === "gemini-2.5-flash" ? cleanContentForStableModel(contents) : contents, 
      config 
    });
  };

  const selectedModel = useFallbackDirectly ? "gemini-2.5-flash" : model;

  // If we've already determined that Gemini is entirely exhausted, route directly to Groq if key is available
  if (useGroqDirectly && process.env.GROQ_API_KEY) {
    console.warn("Directly routing to Groq due to previous Gemini quota exhaustion...");
    finalModelUsed = "llama-3.3-70b-versatile";
    try {
      const response = await callGroqCompletion(contents, config);
      const latencyMs = Date.now() - startTime;
      logAiRequest({
        provider: "Groq",
        model: finalModelUsed,
        user: userId,
        feature,
        inputTokens: response.usageMetadata.promptTokenCount,
        outputTokens: response.usageMetadata.candidatesTokenCount,
        latencyMs,
        success: true
      });
      return response;
    } catch (groqError) {
      console.error("Groq fallback call failed:", groqError);
      const latencyMs = Date.now() - startTime;
      logAiRequest({
        provider: "Groq",
        model: finalModelUsed,
        user: userId,
        feature,
        latencyMs,
        success: false,
        errorMessage: groqError.message
      });
      throw groqError;
    }
  }

  try {
    const response = await generateWithRetry(() => makeCall(selectedModel), maxRetries, retryDelay);
    const latencyMs = Date.now() - startTime;
    let inputTokens = 0;
    let outputTokens = 0;
    
    if (response && response.usageMetadata) {
      inputTokens = response.usageMetadata.promptTokenCount || 0;
      outputTokens = response.usageMetadata.candidatesTokenCount || 0;
    }

    logAiRequest({
      provider: "Gemini",
      model: finalModelUsed,
      user: userId,
      feature,
      inputTokens,
      outputTokens,
      latencyMs,
      success: true
    });

    return response;
  } catch (error) {
    // If Gemini primary fails, fallback to Gemini secondary or Groq
    if (selectedModel !== "gemini-2.5-flash") {
      console.warn(`${selectedModel} failed, falling back to gemini-2.5-flash. Error:`, error.message);
      try {
        const response = await generateWithRetry(() => makeCall("gemini-2.5-flash"), maxRetries, retryDelay);
        const latencyMs = Date.now() - startTime;
        let inputTokens = 0;
        let outputTokens = 0;
        
        if (response && response.usageMetadata) {
          inputTokens = response.usageMetadata.promptTokenCount || 0;
          outputTokens = response.usageMetadata.candidatesTokenCount || 0;
        }

        logAiRequest({
          provider: "Gemini",
          model: "gemini-2.5-flash",
          user: userId,
          feature,
          inputTokens,
          outputTokens,
          latencyMs,
          success: true
        });

        return response;
      } catch (fallbackError) {
        // Fallback to gemini-2.5-flash also failed. Let's try Groq!
        if (process.env.GROQ_API_KEY) {
          console.warn("Gemini 2.5 flash also failed. Routing fallback to Groq. Error:", fallbackError.message);
          useGroqDirectly = true;
          finalModelUsed = "llama-3.3-70b-versatile";
          try {
            const response = await callGroqCompletion(contents, config);
            const latencyMs = Date.now() - startTime;
            logAiRequest({
              provider: "Groq",
              model: finalModelUsed,
              user: userId,
              feature,
              inputTokens: response.usageMetadata.promptTokenCount,
              outputTokens: response.usageMetadata.candidatesTokenCount,
              latencyMs,
              success: true
            });
            return response;
          } catch (groqError) {
            console.error("Groq fallback also failed after Gemini failure:", groqError);
            throw groqError;
          }
        }
        
        console.error("Fallback to gemini-2.5-flash also failed:", fallbackError);
        const latencyMs = Date.now() - startTime;
        logAiRequest({
          provider: "Gemini",
          model: "gemini-2.5-flash",
          user: userId,
          feature,
          latencyMs,
          success: false,
          errorMessage: fallbackError.message
        });
        throw fallbackError;
      }
    } else {
      // Selected model was already gemini-2.5-flash, and it failed. Try Groq!
      if (process.env.GROQ_API_KEY) {
        console.warn("Gemini 2.5 flash failed. Routing fallback to Groq. Error:", error.message);
        useGroqDirectly = true;
        finalModelUsed = "llama-3.3-70b-versatile";
        try {
          const response = await callGroqCompletion(contents, config);
          const latencyMs = Date.now() - startTime;
          logAiRequest({
            provider: "Groq",
            model: finalModelUsed,
            user: userId,
            feature,
            inputTokens: response.usageMetadata.promptTokenCount,
            outputTokens: response.usageMetadata.candidatesTokenCount,
            latencyMs,
            success: true
          });
          return response;
        } catch (groqError) {
          console.error("Groq fallback failed:", groqError);
          throw groqError;
        }
      }
    }
    const latencyMs = Date.now() - startTime;
    logAiRequest({
      provider: "Gemini",
      model: selectedModel,
      user: userId,
      feature,
      latencyMs,
      success: false,
      errorMessage: error.message
    });
    throw error;
  }
}

async function retrieveJobsAgentically({ jobRole, location = "", userId = null }) {
  const jobService = require("./job.service");

  try {
    const prompt = `Find real job applications for: "${jobRole}" in location: "${location || "Worldwide"}". Use the fetchJobPostings tool to search LinkedIn and Shine first.`;

    const config = {
      systemInstruction: "You are a career assistant Agent. You must search for jobs using the fetchJobPostings tool. Always invoke the tool first to fetch jobs, then format the fetched jobs as a clean JSON list.",
      tools: [
        {
          functionDeclarations: [
            {
              name: "fetchJobPostings",
              description: "Retrieves job postings from LinkedIn and Shine for a specific job title and optional location.",
              parameters: {
                type: "OBJECT",
                properties: {
                  jobRole: { type: "STRING", description: "The job title to search (e.g. 'Node.js Developer')" },
                  location: { type: "STRING", description: "The location to search jobs in (e.g. 'India', 'United States', 'Remote')" }
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
      config: config,
      userId,
      feature: "Agentic Job Search"
    });

    console.log("Gemini Agent Call 1 finished. Function Calls:", response.functionCalls);

    let finalOutput = "";

    // 2. Check for tool usage
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      
      if (call.name === "fetchJobPostings") {
        console.log("Agent executing tool: fetchJobPostings for", call.args.jobRole, "in", call.args.location || location);
        
        // Execute the scraper tool
        const jobsFound = await jobService.fetchJobPostings(call.args.jobRole, call.args.location || location);
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
Filter out any job listings that are completely unrelated to the requested role: "${jobRole}" or the requested location: "${location || "Worldwide"}".
Be reasonably flexible: keep titles like 'Full Stack Developer', 'Frontend Engineer', or 'Software Engineer' for a 'React Developer' request if they align with that track, but discard completely different roles.
Format the relevant jobs into a valid JSON object matching this schema:
{
  "jobRole": "${jobRole}",
  "jobs": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "link": "string",
      "platform": "LinkedIn" | "Shine" | "Other"
    }
  ]
}`
          },
          userId,
          feature: "Agentic Job Search"
        });

        finalOutput = secondResponse.text;
      }
    } else {
      // Model returned text directly instead of function calling (e.g., if it didn't use the tool)
      console.log("Model did not request function calling. Running manual fallback.");
      const jobsFound = await jobService.fetchJobPostings(jobRole, location);
      
      const formatResponse = await generateContentWithFallback({
        model: "gemini-3-flash-preview",
        contents: `Format these jobs into the target JSON structure: ${JSON.stringify(jobsFound)}`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: `You are a career advisor agent. Parse and filter the job listings list.
Filter out any job listings that are completely unrelated to the requested role: "${jobRole}" or the requested location: "${location || "Worldwide"}".
Format the relevant jobs into a valid JSON object matching this schema:
{
  "jobRole": "${jobRole}",
  "jobs": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "link": "string",
      "platform": "LinkedIn" | "Shine" | "Other"
    }
  ]
}`
        },
        userId,
        feature: "Agentic Job Search"
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
      const rawJobs = await jobService.fetchJobPostings(jobRole, location);
      return {
        jobRole,
        jobs: rawJobs
      };
    } catch (fallbackError) {
      console.error("LinkedIn / Shine scrape fallback failed:", fallbackError);
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

async function generateQuizAgentically({ mode, skills, jobTitle, numQuestions, difficulty, userId = null }) {
  try {
    const scope = mode === 'jd' 
      ? `Job Description / Title: "${jobTitle}"`
      : `Target Skills: "${skills.join(', ')}"`;

    // Inject randomness: unique seed + random topic pool selection to prevent repeated questions
    const sessionSeed = Math.random().toString(36).substring(2, 12).toUpperCase();
    const timestamp = Date.now();
    const topicVariants = [
      "Focus on edge cases, error handling, and less-common APIs.",
      "Focus on real-world debugging scenarios and performance optimisation.",
      "Focus on best practices, design patterns, and architectural trade-offs.",
      "Focus on comparisons between approaches, gotchas, and anti-patterns.",
      "Focus on practical implementation, code snippets, and runtime behaviour."
    ];
    const topicHint = topicVariants[Math.floor(Math.random() * topicVariants.length)];

    const prompt = `
You are an expert technical interviewer generating a UNIQUE quiz session.
Session ID: ${sessionSeed} | Timestamp: ${timestamp}
${topicHint}

Generate a multiple-choice quiz based on:
${scope}

Difficulty Level: ${difficulty}
Number of Questions: ${numQuestions}

CRITICAL UNIQUENESS RULES:
- This is a fresh session. Generate COMPLETELY NEW questions that are unlikely to appear in another quiz session for the same topic.
- Do NOT use common textbook questions or standard interview boilerplate.
- Draw from a wide variety of sub-topics within the scope — do not cluster around the most obvious concepts.
- Use the session ID as entropy to vary your question selection pattern each time.

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
- The 'correctAnswer' must be an exact string match of one of the options.
- Target difficulty: ${difficulty}. Easy = basic definitions/use-cases; Medium = practical coding/scenarios; Hard = deep architecture, troubleshooting, and edge cases.
- Make every question highly specific and contextual to: ${scope}.
- Vary question formats: some should test knowledge recall, some reasoning, some code comprehension.
`;

    const response = await generateContentWithFallback({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      },
      userId,
      feature: "Quiz Generation"
    });

    console.log("Quiz Raw AI Response (first 300 chars):", (response.text || '').substring(0, 300));
    const parsed = safeParseJSON(response.text);
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

async function generateTailoredResume({ resumeText, jobDescription, userId = null }) {
  try {
    const prompt = `
You are a strict, senior ATS (Applicant Tracking System) optimizer and professional resume writer.
Your task is to tailor the provided Resume to align with the provided Job Description.

CRITICAL RULES:
1. NEVER invent, fabricate, or hallucinate any experience, projects, education, certifications, or skills that the candidate does not possess according to their original resume.
2. Optimize bullet points to emphasize relevant achievements that match the Job Description requirements.
3. Quantify achievements where possible if the original resume implies them.
4. Naturally weave in keywords from the Job Description into the summary and experience bullet points.
5. Create a professional, concise summary that highlights alignment with the target role.
6. Provide an HONEST ATS Analysis with a match score that reflects true keyword and skill alignment.

== MATCH SCORE RUBRIC (follow strictly for atsAnalysis.matchScore) ==
- 0-20:   Resume domain is completely unrelated to the job (e.g. chef applying for software role).
- 21-40:  Different field; only 1-2 transferable soft skills exist.
- 41-55:  Related domain but candidate is missing most required hard skills.
- 56-70:  Partial match — some relevant skills present but several key requirements are missing.
- 71-85:  Good match — meets most requirements with a few gaps.
- 86-95:  Strong match — nearly all requirements met with minor gaps.
- 96-100: Near-perfect alignment across skills, experience, and domain.

CRITICAL: Do NOT award a score above 55 unless the resume explicitly demonstrates at least 50% of the required skills from the job description. If domains are completely different, the score MUST be 25 or below.

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
    "matchScore": 0,
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
      },
      userId,
      feature: "Resume Tailoring"
    });

    console.log("Tailored Resume Raw AI Response (first 300 chars):", (response.text || '').substring(0, 300));
    const parsed = safeParseJSON(response.text);
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
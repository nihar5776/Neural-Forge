const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY
});

// Flag to direct all calls to fallback model if Gemini 3 daily limit is reached
let useGeminiFallbackDirectly = false;

function isGroqEnabled() {
  return !!process.env.GROQ_API_KEY;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generic retry wrapper with exponential backoff
 */
async function runWithRetry(fn, retries = 5, delay = 8000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Check for daily request limits (for Gemini)
      const isDailyLimit = error.message && (
        error.message.includes("PerDay") || 
        error.message.includes("limit: 20") ||
        error.message.includes("limit: 0") ||
        error.message.includes("daily")
      );

      if (isDailyLimit) {
        console.warn("Daily request limit reached on Gemini. Redirecting immediately to fallback model.");
        useGeminiFallbackDirectly = true;
        throw error;
      }

      // Check if the error status/message is retryable (429 rate limit or 503 unavailable)
      const status = error.status || (error.response && error.response.status);
      const message = error.message || "";
      const isRetryable = status === 429 || status === 503 ||
        message.includes("429") || 
        message.includes("503") || 
        message.includes("quota") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.includes("high demand") ||
        message.includes("UNAVAILABLE");

      if (isRetryable && i < retries - 1) {
        console.warn(`Retryable error hit (status ${status || 'unknown'}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await sleep(delay);
        delay *= 2; // exponential backoff
        continue;
      }
      throw error;
    }
  }
}

/**
 * Clean contents for older Gemini fallback model schema validation (excludes nested systems)
 */
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

const { logAiRequest } = require("./aiLogger");

/**
 * Text chat completion (returns JSON parsed object)
 */
async function chatCompletion({ messages, systemInstruction, userId = null, feature = "Mock Interview" }) {
  const startTime = Date.now();
  const isGroq = isGroqEnabled();
  const provider = isGroq ? "Groq" : "Gemini";
  let finalModelUsed = isGroq ? "llama-3.3-70b-versatile" : "gemini-3-flash-preview";
  let usage = { inputTokens: 0, outputTokens: 0 };

  try {
    let result;
    if (isGroq) {
      result = await runWithRetry(async () => {
        console.log("Routing text completion to Groq (Llama 3.1)...");
        const groqMessages = [];
        if (systemInstruction) {
          groqMessages.push({ role: "system", content: systemInstruction });
        }
        groqMessages.push(...messages);

        const response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            response_format: { type: "json_object" }
          },
          {
            headers: {
              "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data.usage) {
          usage.inputTokens = response.data.usage.prompt_tokens || 0;
          usage.outputTokens = response.data.usage.completion_tokens || 0;
        }

        const contentText = response.data.choices[0].message.content;
        return JSON.parse(contentText);
      });
    } else {
      // Route to Gemini
      const geminiMessages = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const makeGeminiCall = async (targetModel) => {
        finalModelUsed = targetModel;
        const cleanMessages = targetModel === "gemini-2.5-flash"
          ? geminiMessages.map(m => cleanContentForStableModel(m))
          : geminiMessages;

        const response = await ai.models.generateContent({
          model: targetModel,
          contents: cleanMessages,
          config: {
            systemInstruction,
            responseMimeType: "application/json"
          }
        });

        if (response.usageMetadata) {
          usage.inputTokens = response.usageMetadata.promptTokenCount || 0;
          usage.outputTokens = response.usageMetadata.candidatesTokenCount || 0;
        }

        return JSON.parse(response.text);
      };

      const preferredModel = useGeminiFallbackDirectly ? "gemini-2.5-flash" : "gemini-3-flash-preview";

      try {
        result = await runWithRetry(() => makeGeminiCall(preferredModel));
      } catch (error) {
        if (preferredModel !== "gemini-2.5-flash") {
          console.warn(`Gemini primary model failed, falling back to gemini-2.5-flash. Error: ${error.message}`);
          try {
            result = await runWithRetry(() => makeGeminiCall("gemini-2.5-flash"));
          } catch (fallbackError) {
            console.error("Gemini fallback model also failed:", fallbackError);
            throw fallbackError;
          }
        } else {
          throw error;
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    logAiRequest({
      provider,
      model: finalModelUsed,
      user: userId,
      feature,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      latencyMs,
      success: true
    });

    return result;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    logAiRequest({
      provider,
      model: finalModelUsed,
      user: userId,
      feature,
      latencyMs,
      success: false,
      errorMessage: error.message
    });
    throw error;
  }
}

/**
 * Transcribe spoken audio file buffer into text
 */
async function transcribeAudio(fileBuffer, mimeType, userId = null, feature = "Audio Transcription") {
  const startTime = Date.now();
  const isGroq = isGroqEnabled();
  const provider = isGroq ? "Groq" : "Gemini";
  let finalModelUsed = isGroq ? "whisper-large-v3" : "gemini-3-flash-preview";

  try {
    let result;
    if (isGroq) {
      result = await runWithRetry(async () => {
        console.log("Routing audio transcription to Groq Whisper...");
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: mimeType });
        formData.append("file", blob, "audio.webm");
        formData.append("model", "whisper-large-v3");

        const response = await axios.post(
          "https://api.groq.com/openai/v1/audio/transcriptions",
          formData,
          {
            headers: {
              "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            }
          }
        );
        return response.data.text;
      });
    } else {
      // Route to Gemini
      result = await runWithRetry(async () => {
        console.log("Routing audio transcription to Gemini Multimodal...");
        const targetModel = useGeminiFallbackDirectly ? "gemini-2.5-flash" : "gemini-3-flash-preview";
        finalModelUsed = targetModel;
        
        const response = await ai.models.generateContent({
          model: targetModel,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: fileBuffer.toString("base64")
                  }
                },
                {
                  text: "Accurately transcribe the speech in this audio file. Return ONLY the transcribed text. Do not add any feedback, descriptions, or additional comments."
                }
              ]
            }
          ]
        });
        return response.text;
      });
    }

    const latencyMs = Date.now() - startTime;
    logAiRequest({
      provider,
      model: finalModelUsed,
      user: userId,
      feature,
      latencyMs,
      success: true
    });

    return result;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    logAiRequest({
      provider,
      model: finalModelUsed,
      user: userId,
      feature,
      latencyMs,
      success: false,
      errorMessage: error.message
    });
    throw error;
  }
}

module.exports = {
  isGroqEnabled,
  chatCompletion,
  transcribeAudio
};

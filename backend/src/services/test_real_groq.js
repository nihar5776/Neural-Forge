require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const aiClient = require('./aiClient');

async function testRealGroq() {
  console.log("Checking if Groq is enabled...");
  console.log("isGroqEnabled:", aiClient.isGroqEnabled());
  
  if (!aiClient.isGroqEnabled()) {
    console.error("GROQ_API_KEY is not defined in process.env. Please make sure the server has loaded the .env file.");
    process.exit(1);
  }

  try {
    console.log("Sending a test request to Groq API (Llama 3.1)...");
    const response = await aiClient.chatCompletion({
      messages: [{ role: "user", content: "State only 'Hello from Groq Llama 3.1!' in a JSON object under the key 'message'." }],
      systemInstruction: "You are a test assistant."
    });
    console.log("Groq response received:", response);
    console.log("\n=================================");
    console.log("YOUR GROQ API KEY IS VALID AND WORKING!");
    console.log("=================================");
  } catch (error) {
    console.error("Failed to connect to Groq API using key.");
    if (error.response && error.response.status === 401) {
      console.error("Error: Unauthorized. Your GROQ_API_KEY might be invalid or copied incorrectly.");
    } else {
      console.error(error.message);
      if (error.response && error.response.data) {
        console.error("Details:", JSON.stringify(error.response.data));
      }
    }
    process.exit(1);
  }
}

testRealGroq();

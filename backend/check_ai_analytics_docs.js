require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const aiAnalyticsModel = require('./src/models/aiAnalytics.model');

async function checkDocs() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.mongo_uri);
    console.log("Connected successfully.");
    
    const count = await aiAnalyticsModel.countDocuments();
    console.log(`Total documents in AiAnalytics collection: ${count}`);
    
    if (count > 0) {
      const sample = await aiAnalyticsModel.findOne().lean();
      console.log("Sample document:", JSON.stringify(sample, null, 2));
    }
  } catch (error) {
    console.error("Error checking AiAnalytics:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

checkDocs();

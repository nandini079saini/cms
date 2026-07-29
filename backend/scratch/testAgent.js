require("dotenv").config();
const db = require("../db");
const { getRelatedAgentRecommendations } = require("../services/recommendationAgent");
const { closeMcpClient } = require("../services/mcpClient");

async function test() {
  try {
    console.log("Fetching a sample post from the database...");
    const [posts] = await db.query("SELECT id, title, category FROM posts LIMIT 1");
    if (posts.length === 0) {
      console.log("No posts found in the database. Please add a post first.");
      process.exit(0);
    }
    
    const targetPost = posts[0];
    console.log("----------------------------------------");
    console.log("TARGET POST FOR RECOMMENDATION:");
    console.log(`ID: ${targetPost.id}`);
    console.log(`Title: ${targetPost.title}`);
    console.log(`Category: ${targetPost.category}`);
    console.log("----------------------------------------");

    console.log("Running the autonomous MCP recommendation agent...");
    const recommendations = await getRelatedAgentRecommendations(targetPost.id, 3, "meta/llama-3.3-70b-instruct");
    
    console.log("----------------------------------------");
    console.log("AGENT RECOMMENDATION RESULTS:");
    console.log("Recommended IDs:", recommendations);
    console.log("----------------------------------------");

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    console.log("Closing MCP client and database connections...");
    await closeMcpClient();
    await db.end();
    console.log("Test finished.");
  }
}

test();

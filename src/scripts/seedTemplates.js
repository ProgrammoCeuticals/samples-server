require("dotenv").config();

const { connectDb } = require("../config/db");
const { seedTemplates } = require("../config/seedTemplates");

async function run() {
  try {
    await connectDb(process.env.MONGO_URI);
    await seedTemplates();
    console.log("Templates seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Template seeding failed:", error.message);
    process.exit(1);
  }
}

run();

import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    if (!uri) throw new Error("MONGODB_URI is missing");
    console.log("🔌 Connecting to MongoDB…");
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
}

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db.js";
import { Tweet } from "./models/tweet.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://tcrier.netlify.app",   
  "https://tcrier.com",
  "https://www.tcrier.com"
];
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    return allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());

await connectDB(process.env.MONGODB_URI);

app.get("/", (req, res) => {
  res.json({ ok: true, app: "towncrier-backend" });
});

app.get("/api/tweets", async (req, res) => {
  const tweets = await Tweet.find().sort({ createdAt: -1 }).lean();
  res.json(
    tweets.map(t => ({
      id: t._id.toString(),
      user: t.user,
      text: t.text,
      createdAt: new Date(t.createdAt).getTime(),
      likes: t.likes ?? 0
    }))
  );
});

app.post("/api/tweets", async (req, res) => {
  const { user = "anon", text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "text is required" });
  if (text.trim().length > 280) return res.status(400).json({ error: "max length is 280" });

  const t = await Tweet.create({ user: String(user).trim(), text: text.trim() });
  res.status(201).json({
    id: t._id.toString(),
    user: t.user,
    text: t.text,
    createdAt: new Date(t.createdAt).getTime(),
    likes: t.likes ?? 0
  });
});

app.put("/api/tweets/:id/like", async (req, res) => {
  const { id } = req.params;
  const { delta = 1 } = req.body || {};
  const t = await Tweet.findById(id);
  if (!t) return res.status(404).json({ error: "not found" });
  t.likes = Math.max(0, (t.likes ?? 0) + Number(delta));
  await t.save();
  res.json({
    id: t._id.toString(),
    user: t.user,
    text: t.text,
    createdAt: new Date(t.createdAt).getTime(),
    likes: t.likes
  });
});

app.delete("/api/tweets/:id", async (req, res) => {
  const { id } = req.params;
  const result = await Tweet.findByIdAndDelete(id);
  if (!result) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});

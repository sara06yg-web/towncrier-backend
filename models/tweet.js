import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true, maxlength: 280 },
    likes: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);

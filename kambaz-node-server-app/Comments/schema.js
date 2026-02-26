import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "SavedItem", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
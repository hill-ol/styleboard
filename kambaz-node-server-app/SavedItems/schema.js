import mongoose from "mongoose";

const savedItemSchema = new mongoose.Schema(
  {
    unsplashId: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    title: { type: String, default: "" },
    photographer: { type: String, default: "" },
    photographerUrl: { type: String, default: "" },
    tags: [{ type: String }],
    aesthetic: { type: String, default: "" },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    saveCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("SavedItem", savedItemSchema);
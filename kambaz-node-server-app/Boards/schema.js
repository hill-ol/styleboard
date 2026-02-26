import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    aesthetic: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    coverImageUrl: { type: String, default: "" },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "SavedItem" }],
  },
  { timestamps: true }
);

export default mongoose.model("Board", boardSchema);
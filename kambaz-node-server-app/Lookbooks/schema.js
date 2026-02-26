import mongoose from "mongoose";

const lookbookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    caption: { type: String, default: "" },
    stylist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverImageUrl: { type: String, default: "" },
    aesthetic: { type: String, default: "" },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "SavedItem" }],
    isPublished: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Lookbook", lookbookSchema);
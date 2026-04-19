"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { getPhotoById, triggerDownload } from "../../../services/unsplash.service";
import { timeAgo } from "../../../utils/dateUtils";
import {
  getItemByUnsplashId,
  saveItem,
  unsaveItem,
} from "../../../services/items.service";
import { addComment, deleteComment } from "../../../services/comments.service";
import { getBoardsByUser, addItemToBoard } from "../../../services/boards.service";

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const router = useRouter();

  const [photo, setPhoto] = useState<any>(null);
  const [localItem, setLocalItem] = useState<any>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showBoardPicker, setShowBoardPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commenting, setCommenting] = useState(false);

  // AI outfit suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");

  const isSaved = localItem?.savedBy?.some(
    (u: any) => u._id === currentUser?._id || u === currentUser?._id
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [unsplashData, localData] = await Promise.allSettled([
          getPhotoById(id),
          getItemByUnsplashId(id),
        ]);
        if (unsplashData.status === "fulfilled") setPhoto(unsplashData.value);
        if (localData.status === "fulfilled") setLocalItem(localData.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (currentUser) {
      getBoardsByUser(currentUser._id).then(setBoards).catch(console.error);
    }
  }, [currentUser]);

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestionsError("");
    setSuggestions([]);
    try {
      const tags = photo?.tags?.map((t: any) => t.title).join(", ") || "";
      const description = photo?.alt_description || "fashion photo";
      const prompt = `You are a fashion stylist. Based on this fashion photo described as "${description}" with style tags: ${tags}, give 4 specific outfit suggestions to complement or recreate this look. Format your response as exactly 4 suggestions, each on a new line starting with a number and period (e.g. "1. ..."). Keep each suggestion to 1-2 sentences and be specific about clothing items, colors, and accessories.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const lines = text
        .split("\n")
        .filter((line: string) => /^\d+\./.test(line.trim()))
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim());
      setSuggestions(lines);
    } catch (err) {
      setSuggestionsError("Could not load suggestions. Try again.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) { router.push("/login"); return; }
    setSaving(true);
    try {
      if (isSaved && localItem) {
        const updated = await unsaveItem(localItem._id);
        setLocalItem(updated);
      } else {
        const updated = await saveItem({
          unsplashId: id,
          imageUrl: photo?.urls?.regular || photo?.urls?.small,
          title: photo?.alt_description || "",
          photographer: photo?.user?.name || "",
          photographerUrl: photo?.user?.links?.html || "",
          tags: photo?.tags?.map((t: any) => t.title) || [],
        });
        setLocalItem(updated);
        await triggerDownload(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddToBoard = async (boardId: string) => {
    if (!localItem) {
      const saved = await saveItem({
        unsplashId: id,
        imageUrl: photo?.urls?.regular || photo?.urls?.small,
        title: photo?.alt_description || "",
        photographer: photo?.user?.name || "",
      });
      setLocalItem(saved);
      await addItemToBoard(boardId, saved._id);
    } else {
      await addItemToBoard(boardId, localItem._id);
    }
    setShowBoardPicker(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { router.push("/login"); return; }
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      let item = localItem;
      if (!item) {
        item = await saveItem({
          unsplashId: id,
          imageUrl: photo?.urls?.regular || photo?.urls?.small,
          title: photo?.alt_description || "",
          photographer: photo?.user?.name || "",
        });
        setLocalItem(item);
      }
      const newComment = await addComment(item._id, commentText);
      setLocalItem((prev: any) => ({
        ...prev,
        comments: [...(prev?.comments || []), newComment],
      }));
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteComment = async (cid: string) => {
    await deleteComment(cid);
    setLocalItem((prev: any) => ({
      ...prev,
      comments: prev.comments.filter((c: any) => c._id !== cid),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!photo && !localItem) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Photo not found.</p>
        <Link href="/search" className="text-rose-500 hover:underline">Back to search</Link>
      </div>
    );
  }

  const imageUrl = photo?.urls?.regular || localItem?.imageUrl;
  const title = photo?.alt_description || localItem?.title || "Fashion inspiration";
  const photographer = photo?.user?.name || localItem?.photographer;
  const photographerUrl = photo?.user?.links?.html || localItem?.photographerUrl;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left — image */}
          <div className="relative">
            <img
              src={imageUrl}
              alt={title}
              className="w-full rounded-3xl object-cover shadow-md"
            />
          </div>

          {/* Right — details & actions */}
          <div className="flex flex-col gap-6">

            {/* Title & photographer */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                {title}
              </h1>
              {photographer && (
                <p className="text-sm text-gray-500">
                  Photo by{" "}
                  {photographerUrl ? (
                    <a
                      href={photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-500 hover:underline"
                    >
                      {photographer}
                    </a>
                  ) : (
                    photographer
                  )}
                  {" "}on Unsplash
                </p>
              )}
              {localItem?.saveCount > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  ♥ {localItem.saveCount} saves on StyleBoard
                </p>
              )}
            </div>

            {/* Tags */}
            {photo?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photo.tags.slice(0, 6).map((tag: any) => (
                  <Link
                    key={tag.title}
                    href={`/search?q=${encodeURIComponent(tag.title)}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
                  >
                    {tag.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 py-3 rounded-full text-sm font-semibold transition-colors ${
                  isSaved
                    ? "bg-rose-400 text-white hover:bg-rose-500"
                    : "bg-black text-white hover:bg-gray-800"
                } disabled:opacity-50`}
              >
                {saving ? "..." : isSaved ? "♥ Saved" : "♡ Save"}
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    if (!currentUser) { router.push("/login"); return; }
                    setShowBoardPicker(!showBoardPicker);
                  }}
                  className="px-5 py-3 rounded-full border border-gray-200 text-sm font-semibold hover:border-black transition-colors"
                >
                  + Board
                </button>

                {showBoardPicker && (
                  <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 w-56 z-20">
                    <p className="text-xs font-medium text-gray-500 mb-2 px-1">Add to board</p>
                    {boards.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-gray-400 mb-2">No boards yet</p>
                        <Link
                          href="/profile"
                          className="text-xs text-rose-500 hover:underline"
                          onClick={() => setShowBoardPicker(false)}
                        >
                          Create a board
                        </Link>
                      </div>
                    ) : (
                      boards.map((board: any) => (
                        <button
                          key={board._id}
                          onClick={() => handleAddToBoard(board._id)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          {board.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI Outfit Suggestions */}
            <div className="border border-dusty-100 rounded-2xl p-5 bg-blush/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-warm-900">✦ AI Outfit Suggestions</h3>
                  <p className="text-xs text-warm-900/50 mt-0.5">Powered by Gemini</p>
                </div>
                <button
                  onClick={handleGetSuggestions}
                  disabled={loadingSuggestions}
                  className="bg-dusty-400 hover:bg-dusty-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                >
                  {loadingSuggestions ? "Generating..." : suggestions.length > 0 ? "Refresh" : "Get Suggestions"}
                </button>
              </div>

              {suggestionsError && (
                <p className="text-xs text-red-400">{suggestionsError}</p>
              )}

              {loadingSuggestions && (
                <div className="space-y-2 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-dusty-100 rounded animate-pulse" />
                  ))}
                </div>
              )}

              {suggestions.length > 0 && (
                <ul className="space-y-3 mt-2">
                  {suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-warm-900/80">
                      <span className="text-dusty-400 font-bold flex-shrink-0">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}

              {!loadingSuggestions && suggestions.length === 0 && !suggestionsError && (
                <p className="text-xs text-warm-900/40 mt-1">
                  Click "Get Suggestions" for AI-powered outfit ideas based on this look.
                </p>
              )}
            </div>

            {/* Comments section */}
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Comments {localItem?.comments?.length > 0 && `(${localItem.comments.length})`}
              </h2>

              {currentUser ? (
                <form onSubmit={handleComment} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={commenting || !commentText.trim()}
                    className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    Post
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-500 mb-6">
                  <Link href="/login" className="text-rose-500 hover:underline">Log in</Link>
                  {" "}to leave a comment
                </p>
              )}

              <div className="space-y-4">
                {localItem?.comments?.length === 0 || !localItem?.comments ? (
                  <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
                ) : (
                  localItem.comments.map((comment: any) => (
                    <div key={comment._id} className="flex gap-3 items-start">
                      <Link href={`/profile/${comment.author?._id}`}>
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-xs font-semibold flex-shrink-0">
                          {comment.author?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/profile/${comment.author?._id}`}
                            className="text-xs font-semibold text-gray-900 hover:text-rose-500 transition-colors"
                          >
                            {comment.author?.username}
                          </Link>
                          <span className="text-xs text-gray-400">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                      {currentUser?._id === comment.author?._id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-xs text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
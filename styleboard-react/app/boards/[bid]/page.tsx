"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { getBoardById, deleteBoard, removeItemFromBoard, updateBoard } from "../../../services/boards.service";

export default function BoardDetailPage() {
  const { bid } = useParams<{ bid: string }>();
  const { currentUser } = useAuth();
  const router = useRouter();

  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", aesthetic: "" });
  const [saving, setSaving] = useState(false);

  const AESTHETICS = [
    "Y2K", "Dark Academia", "Cottagecore", "Streetwear",
    "Minimalist", "Vintage", "Grunge", "Boho", "Clean Girl", "Old Money",
  ];

  const isOwner = currentUser && board?.owner?._id === currentUser._id;

  useEffect(() => {
    getBoardById(bid)
      .then((data) => {
        setBoard(data);
        setEditForm({ name: data.name, description: data.description || "", aesthetic: data.aesthetic || "" });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateBoard(bid, editForm);
      setBoard((prev: any) => ({ ...prev, ...updated }));
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this board? This cannot be undone.")) return;
    await deleteBoard(bid);
    router.push("/profile");
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItemFromBoard(bid, itemId);
    setBoard((prev: any) => ({
      ...prev,
      items: prev.items.filter((item: any) => item._id !== itemId),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Board not found.</p>
        <Link href="/profile" className="text-rose-500 hover:underline">Back to profile</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Board header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-black transition-colors mb-6 flex items-center gap-1"
          >
            ← Back
          </button>

          {editing ? (
            <div className="space-y-3 max-w-md">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Board name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <input
                type="text"
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <select
                value={editForm.aesthetic}
                onChange={(e) => setEditForm((p) => ({ ...p, aesthetic: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              >
                <option value="">No aesthetic</option>
                {AESTHETICS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-5 py-2 rounded-full border border-gray-200 text-sm hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
                  {board.aesthetic && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                      {board.aesthetic}
                    </span>
                  )}
                  {!board.isPublic && (
                    <span className="px-3 py-1 bg-yellow-100 rounded-full text-xs text-yellow-700">
                      Private
                    </span>
                  )}
                </div>
                {board.description && (
                  <p className="text-gray-500 text-sm mb-2">{board.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{board.items?.length || 0} items</span>
                  <span>by{" "}
                    <Link
                      href={isOwner ? "/profile" : `/profile/${board.owner?._id}`}
                      className="text-rose-500 hover:underline"
                    >
                      {board.owner?.username}
                    </Link>
                  </span>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-5 py-2 rounded-full border border-gray-200 text-sm font-medium hover:border-black transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 rounded-full border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Items grid */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {board.items?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-4">✦</p>
            <p className="text-gray-400 mb-4">This board is empty</p>
            <Link
              href="/search"
              className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Discover photos to add
            </Link>
          </div>
        ) : (
          <div className="columns-2 md:columns-4 gap-4">
            {board.items.map((item: any) => (
              <div key={item._id} className="mb-4 break-inside-avoid group relative">
                <Link href={`/details/${item.unsplashId}`}>
                  <img
                    src={item.imageUrl}
                    alt={item.title || "fashion"}
                    className="w-full rounded-2xl object-cover group-hover:opacity-90 transition-opacity"
                  />
                </Link>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm shadow-sm"
                  >
                    ✕
                  </button>
                )}
                {item.title && (
                  <p className="text-xs text-gray-500 mt-1.5 px-1 truncate">{item.title}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
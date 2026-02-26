"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import {
  getLookbooksByStylist,
  createLookbook,
  updateLookbook,
  deleteLookbook,
} from "../../../services/lookbooks.service";

const AESTHETICS = [
  "Y2K", "Dark Academia", "Cottagecore", "Streetwear",
  "Minimalist", "Vintage", "Grunge", "Boho", "Clean Girl", "Old Money",
];

export default function StylistDashboard() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  const [lookbooks, setLookbooks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    caption: "",
    aesthetic: "",
    coverImageUrl: "",
    isPublished: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!currentUser) { router.push("/login"); return; }
      if (currentUser.role !== "stylist") { router.push("/"); return; }
      getLookbooksByStylist(currentUser._id).then(setLookbooks).catch(console.error);
    }
  }, [currentUser, loading]);

  const resetForm = () => {
    setForm({ title: "", caption: "", aesthetic: "", coverImageUrl: "", isPublished: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateLookbook(editingId, form);
        setLookbooks((prev) => prev.map((lb) => lb._id === editingId ? { ...lb, ...updated } : lb));
      } else {
        const created = await createLookbook(form);
        setLookbooks((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lb: any) => {
    setForm({
      title: lb.title,
      caption: lb.caption || "",
      aesthetic: lb.aesthetic || "",
      coverImageUrl: lb.coverImageUrl || "",
      isPublished: lb.isPublished,
    });
    setEditingId(lb._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lookbook?")) return;
    await deleteLookbook(id);
    setLookbooks((prev) => prev.filter((lb) => lb._id !== id));
  };

  const handleTogglePublish = async (lb: any) => {
    const updated = await updateLookbook(lb._id, { isPublished: !lb.isPublished });
    setLookbooks((prev) => prev.map((l) => l._id === lb._id ? { ...l, ...updated } : l));
  };

  if (loading || !currentUser) return null;

  const published = lookbooks.filter((lb) => lb.isPublished);
  const drafts = lookbooks.filter((lb) => !lb.isPublished);
  const totalViews = lookbooks.reduce((sum, lb) => sum + (lb.viewCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stylist Studio</h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {currentUser.displayName || currentUser.username}
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              + New Lookbook
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: "Total Lookbooks", value: lookbooks.length },
              { label: "Published", value: published.length },
              { label: "Total Views", value: totalViews },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Create / Edit form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editingId ? "Edit Lookbook" : "Create New Lookbook"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Give your lookbook a title"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <textarea
                  value={form.caption}
                  onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
                  placeholder="Describe the vibe or story behind this lookbook..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aesthetic</label>
                  <select
                    value={form.aesthetic}
                    onChange={(e) => setForm((p) => ({ ...p, aesthetic: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                  >
                    <option value="">Select aesthetic</option>
                    {AESTHETICS.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={form.coverImageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, coverImageUrl: e.target.value }))}
                    placeholder="Paste an image URL"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                  className="rounded"
                />
                Publish immediately
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-full border border-gray-200 text-sm hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Published lookbooks */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Published <span className="text-gray-400 font-normal">({published.length})</span>
          </h2>
          {published.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-400">No published lookbooks yet. Create one and publish it!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {published.map((lb: any) => (
                <LookbookCard
                  key={lb._id}
                  lb={lb}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          )}
        </div>

        {/* Drafts */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Drafts <span className="text-gray-400 font-normal">({drafts.length})</span>
          </h2>
          {drafts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-400">No drafts</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {drafts.map((lb: any) => (
                <LookbookCard
                  key={lb._id}
                  lb={lb}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LookbookCard({ lb, onEdit, onDelete, onTogglePublish }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-50 overflow-hidden">
        {lb.coverImageUrl ? (
          <img src={lb.coverImageUrl} alt={lb.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
            <span className="text-3xl">✦</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 leading-tight">{lb.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
            lb.isPublished ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
          }`}>
            {lb.isPublished ? "Live" : "Draft"}
          </span>
        </div>
        {lb.aesthetic && <p className="text-xs text-gray-400 mb-1">{lb.aesthetic}</p>}
        {lb.caption && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{lb.caption}</p>}
        <p className="text-xs text-gray-400 mb-3">👁 {lb.viewCount || 0} views</p>
        <div className="flex gap-2">
          <button
            onClick={() => onTogglePublish(lb)}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${
              lb.isPublished
                ? "border border-gray-200 text-gray-600 hover:border-gray-400"
                : "bg-rose-400 text-white hover:bg-rose-500"
            }`}
          >
            {lb.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={() => onEdit(lb)}
            className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium hover:border-black transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(lb._id)}
            className="px-3 py-1.5 rounded-full border border-red-100 text-xs font-medium text-red-400 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
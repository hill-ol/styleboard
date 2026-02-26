"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { updateUser, getUserById } from "../../services/users.service";
import { getBoardsByUser } from "../../services/boards.service";
import { getLookbooksByStylist } from "../../services/lookbooks.service";
import { createBoard } from "../../services/boards.service";

const AESTHETICS = [
  "Y2K", "Dark Academia", "Cottagecore", "Streetwear",
  "Minimalist", "Vintage", "Grunge", "Boho", "Clean Girl", "Old Money",
];

export default function OwnProfilePage() {
  const { currentUser, setCurrentUser, loading } = useAuth();
  const router = useRouter();

  const [boards, setBoards] = useState<any[]>([]);
  const [lookbooks, setLookbooks] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [followerUsers, setFollowerUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("boards");
  const [editing, setEditing] = useState(false);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", bio: "", aesthetics: [] as string[] });
  const [newBoard, setNewBoard] = useState({ name: "", description: "", aesthetic: "", isPublic: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) router.push("/login");
  }, [currentUser, loading]);

  useEffect(() => {
    if (currentUser) {
      setEditForm({
        displayName: currentUser.displayName || "",
        bio: currentUser.bio || "",
        aesthetics: currentUser.aesthetics || [],
      });
      getBoardsByUser(currentUser._id).then(setBoards).catch(console.error);
      if (currentUser.role === "stylist") {
        getLookbooksByStylist(currentUser._id).then(setLookbooks).catch(console.error);
      }
      // Fetch full user objects for following/followers
      if (currentUser.following?.length) {
        Promise.all(currentUser.following.map((id: string) => getUserById(id)))
          .then(setFollowingUsers)
          .catch(console.error);
      }
      if (currentUser.followers?.length) {
        Promise.all(currentUser.followers.map((id: string) => getUserById(id)))
          .then(setFollowerUsers)
          .catch(console.error);
      }
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const updated = await updateUser(currentUser._id, editForm);
      setCurrentUser({ ...currentUser, ...updated });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleAesthetic = (tag: string) => {
    setEditForm((prev) => ({
      ...prev,
      aesthetics: prev.aesthetics.includes(tag)
        ? prev.aesthetics.filter((a) => a !== tag)
        : [...prev.aesthetics, tag],
    }));
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoard.name.trim()) return;
    try {
      const board = await createBoard(newBoard);
      setBoards((prev) => [board, ...prev]);
      setNewBoard({ name: "", description: "", aesthetic: "", isPublic: true });
      setShowNewBoard(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-4xl font-bold flex-shrink-0">
              {currentUser.displayName?.[0]?.toUpperCase() || currentUser.username[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm((p) => ({ ...p, displayName: e.target.value }))}
                    placeholder="Display name"
                    className="w-full md:max-w-xs px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Write a short bio..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {AESTHETICS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleAesthetic(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          editForm.aesthetics.includes(tag)
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-5 py-2 rounded-full text-sm border border-gray-200 hover:border-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {currentUser.displayName || currentUser.username}
                    </h1>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      currentUser.role === "stylist"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">@{currentUser.username}</p>
                  <p className="text-sm text-gray-500 mb-1">{currentUser.email}</p>
                  {currentUser.bio && (
                    <p className="text-sm text-gray-700 mb-3">{currentUser.bio}</p>
                  )}
                  {currentUser.aesthetics && currentUser.aesthetics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {currentUser.aesthetics.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span><strong className="text-gray-900">{boards.length}</strong> boards</span>
                    <span><strong className="text-gray-900">{currentUser.following?.length || 0}</strong> following</span>
                    <span><strong className="text-gray-900">{currentUser.followers?.length || 0}</strong> followers</span>
                  </div>
                </>
              )}
            </div>

            {/* Edit button */}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 rounded-full border border-gray-200 text-sm font-medium hover:border-black transition-colors"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-8">
            {["boards", currentUser.role === "stylist" ? "lookbooks" : null, "following", "followers"]
              .filter(Boolean)
              .map((tab) => (
                <button
                  key={tab!}
                  onClick={() => setActiveTab(tab!)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Boards tab */}
        {activeTab === "boards" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">My Boards</h2>
              <button
                onClick={() => setShowNewBoard(!showNewBoard)}
                className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                + New Board
              </button>
            </div>

            {/* New board form */}
            {showNewBoard && (
              <form
                onSubmit={handleCreateBoard}
                className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-3"
              >
                <h3 className="font-semibold text-gray-900">Create a new board</h3>
                <input
                  type="text"
                  value={newBoard.name}
                  onChange={(e) => setNewBoard((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Board name *"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <input
                  type="text"
                  value={newBoard.description}
                  onChange={(e) => setNewBoard((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <select
                  value={newBoard.aesthetic}
                  onChange={(e) => setNewBoard((p) => ({ ...p, aesthetic: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                >
                  <option value="">Select aesthetic (optional)</option>
                  {AESTHETICS.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBoard.isPublic}
                    onChange={(e) => setNewBoard((p) => ({ ...p, isPublic: e.target.checked }))}
                    className="rounded"
                  />
                  Make this board public
                </label>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Create Board
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewBoard(false)}
                    className="px-5 py-2 rounded-full border border-gray-200 text-sm hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {boards.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400 mb-4">No boards yet</p>
                <button
                  onClick={() => setShowNewBoard(true)}
                  className="text-sm text-rose-500 hover:underline"
                >
                  Create your first board
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {boards.map((board: any) => (
                  <Link key={board._id} href={`/boards/${board._id}`}>
                    <div className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-white">
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        {board.coverImageUrl ? (
                          <img
                            src={board.coverImageUrl}
                            alt={board.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
                            <span className="text-4xl">✦</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm text-gray-900 truncate">{board.name}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          {board.aesthetic && (
                            <p className="text-xs text-gray-400">{board.aesthetic}</p>
                          )}
                          <p className="text-xs text-gray-400 ml-auto">
                            {board.items?.length || 0} items
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lookbooks tab — stylist only */}
        {activeTab === "lookbooks" && currentUser.role === "stylist" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">My Lookbooks</h2>
              <Link
                href="/stylist/dashboard"
                className="bg-rose-400 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-rose-500 transition-colors"
              >
                + New Lookbook
              </Link>
            </div>
            {lookbooks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400 mb-4">No lookbooks yet</p>
                <Link href="/stylist/dashboard" className="text-sm text-rose-500 hover:underline">
                  Create your first lookbook
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {lookbooks.map((lb: any) => (
                  <div key={lb._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
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
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{lb.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          lb.isPublished ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                        }`}>
                          {lb.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      {lb.aesthetic && <p className="text-xs text-gray-400">{lb.aesthetic}</p>}
                      <p className="text-xs text-gray-400 mt-1">👁 {lb.viewCount} views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Following tab */}
        {activeTab === "following" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Following</h2>
            {followingUsers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400 mb-4">Not following anyone yet</p>
                <Link href="/search" className="text-sm text-rose-500 hover:underline">
                  Discover people to follow
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {followingUsers.map((user: any) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Followers tab */}
        {activeTab === "followers" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Followers</h2>
            {followerUsers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400">No followers yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {followerUsers.map((user: any) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user }: { user: any }) {
  return (
    <Link href={`/profile/${user._id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow group">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold mx-auto mb-3 group-hover:bg-rose-200 transition-colors">
          {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
        </div>
        <p className="text-sm font-semibold text-gray-900 truncate">
          {user.displayName || user.username}
        </p>
        <p className="text-xs text-gray-400 truncate">@{user.username}</p>
        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
          user.role === "stylist"
            ? "bg-rose-100 text-rose-600"
            : "bg-gray-100 text-gray-500"
        }`}>
          {user.role}
        </span>
      </div>
    </Link>
  );
}
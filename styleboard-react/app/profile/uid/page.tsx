"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { getUserById, followUser, unfollowUser } from "../../../services/users.service";
import { getBoardsByUser } from "../../../services/boards.service";
import { getLookbooksByStylist } from "../../../services/lookbooks.service";

export default function PublicProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const { currentUser } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [lookbooks, setLookbooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("boards");
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  const isOwnProfile = currentUser?._id === uid;

  useEffect(() => {
    if (isOwnProfile) { router.push("/profile"); return; }
    const fetchData = async () => {
      try {
        const userData = await getUserById(uid);
        setUser(userData);
        setFollowing(
          currentUser?.following?.includes(uid) || false
        );
        const [userBoards, userLookbooks] = await Promise.allSettled([
          getBoardsByUser(uid),
          userData.role === "stylist" ? getLookbooksByStylist(uid) : Promise.resolve([]),
        ]);
        if (userBoards.status === "fulfilled") setBoards(userBoards.value);
        if (userLookbooks.status === "fulfilled") setLookbooks(userLookbooks.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) { router.push("/login"); return; }
    try {
      if (following) {
        await unfollowUser(uid);
        setFollowing(false);
        setUser((prev: any) => ({
          ...prev,
          followers: prev.followers.filter((id: string) => id !== currentUser._id),
        }));
      } else {
        await followUser(uid);
        setFollowing(true);
        setUser((prev: any) => ({
          ...prev,
          followers: [...(prev.followers || []), currentUser._id],
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">User not found.</p>
        <Link href="/" className="text-rose-500 hover:underline">Go home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-4xl font-bold flex-shrink-0">
              {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.displayName || user.username}
                </h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  user.role === "stylist"
                    ? "bg-rose-100 text-rose-600"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
              {user.bio && <p className="text-sm text-gray-700 mb-3">{user.bio}</p>}
              {user.aesthetics?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {user.aesthetics.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span><strong className="text-gray-900">{boards.filter(b => b.isPublic).length}</strong> boards</span>
                <span><strong className="text-gray-900">{user.following?.length || 0}</strong> following</span>
                <span><strong className="text-gray-900">{user.followers?.length || 0}</strong> followers</span>
              </div>
            </div>

            {currentUser && (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  following
                    ? "border border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-500"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-8">
            {["boards", user.role === "stylist" ? "lookbooks" : null]
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Public boards */}
        {activeTab === "boards" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Boards</h2>
            {boards.filter(b => b.isPublic).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400">No public boards yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {boards.filter(b => b.isPublic).map((board: any) => (
                  <Link key={board._id} href={`/boards/${board._id}`}>
                    <div className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-white">
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        {board.coverImageUrl ? (
                          <img src={board.coverImageUrl} alt={board.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
                            <span className="text-4xl">✦</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm text-gray-900 truncate">{board.name}</p>
                        {board.aesthetic && <p className="text-xs text-gray-400 mt-0.5">{board.aesthetic}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lookbooks — stylist only */}
        {activeTab === "lookbooks" && user.role === "stylist" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Lookbooks</h2>
            {lookbooks.filter(lb => lb.isPublished).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400">No published lookbooks yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {lookbooks.filter(lb => lb.isPublished).map((lb: any) => (
                  <div key={lb._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-gray-50">
                      {lb.coverImageUrl ? (
                        <img src={lb.coverImageUrl} alt={lb.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
                          <span className="text-3xl">✦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{lb.title}</h3>
                      {lb.caption && <p className="text-sm text-gray-500 line-clamp-2">{lb.caption}</p>}
                      {lb.aesthetic && <p className="text-xs text-gray-400 mt-2">{lb.aesthetic}</p>}
                      <p className="text-xs text-gray-400 mt-1">👁 {lb.viewCount} views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
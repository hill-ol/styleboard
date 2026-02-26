"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { getRandomFashionPhotos } from "../services/unsplash.service";
import { getTrendingItems } from "../services/items.service";
import { getBoardsByUser } from "../services/boards.service";

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const [heroPhotos, setHeroPhotos] = useState<any[]>([]);
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [myBoards, setMyBoards] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const AESTHETICS = [
    "Y2K", "Dark Academia", "Cottagecore", "Streetwear",
    "Minimalist", "Vintage", "Grunge", "Boho", "Clean Girl", "Old Money",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photos, trending] = await Promise.all([
          getRandomFashionPhotos(8),
          getTrendingItems(),
        ]);
        setHeroPhotos(photos);
        setTrendingItems(trending);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      getBoardsByUser(currentUser._id)
        .then(setMyBoards)
        .catch(console.error);
    }
  }, [currentUser]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 z-10">
            {currentUser ? (
              <>
                <p className="text-rose-400 text-sm font-medium tracking-widest uppercase mb-3">
                  Welcome back
                </p>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                  Hey, {currentUser.displayName || currentUser.username} ✦
                </h1>
                <p className="text-gray-400 text-lg mb-8">
                  {currentUser.role === "stylist"
                    ? "Your studio is ready. Create, curate, inspire."
                    : "Your boards are waiting. Keep building your aesthetic."}
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/search"
                    className="bg-rose-400 hover:bg-rose-500 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                  >
                    Discover More
                  </Link>
                  <Link
                    href="/profile"
                    className="border border-white/30 hover:border-white text-white px-6 py-3 rounded-full font-semibold transition-colors"
                  >
                    My Profile
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-rose-400 text-sm font-medium tracking-widest uppercase mb-3">
                  Fashion · Curation · Community
                </p>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                  Define your<br />
                  <span className="text-rose-400">aesthetic.</span>
                </h1>
                <p className="text-gray-400 text-lg mb-8">
                  Discover fashion inspiration, build curated boards, and connect with stylists who inspire you.
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/register"
                    className="bg-rose-400 hover:bg-rose-500 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/search"
                    className="border border-white/30 hover:border-white text-white px-6 py-3 rounded-full font-semibold transition-colors"
                  >
                    Browse Looks
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Hero photo grid */}
          <div className="flex-1 grid grid-cols-2 gap-3 max-w-md w-full">
            {fetching
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-800 rounded-2xl animate-pulse" />
                ))
              : heroPhotos.slice(0, 4).map((photo: any) => (
                  <Link key={photo.id} href={`/details/${photo.id}`}>
                    <img
                      src={photo.urls?.small}
                      alt={photo.alt_description || "fashion"}
                      className="aspect-square object-cover rounded-2xl hover:opacity-90 transition-opacity cursor-pointer w-full"
                    />
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ── Aesthetic tags ── */}
      <section className="border-b border-gray-100 py-5 overflow-x-auto">
        <div className="flex gap-3 px-6 max-w-7xl mx-auto">
          {AESTHETICS.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-black hover:text-black transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Logged-in: My Boards ── */}
      {currentUser && (
        <section className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Boards</h2>
            <Link href="/profile" className="text-sm text-rose-500 hover:text-rose-600 font-medium">
              View all →
            </Link>
          </div>
          {myBoards.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-12 text-center">
              <p className="text-gray-500 mb-4">You haven't created any boards yet.</p>
              <Link
                href="/search"
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Start discovering
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {myBoards.slice(0, 4).map((board: any) => (
                <Link key={board._id} href={`/boards/${board._id}`}>
                  <div className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {board.coverImageUrl ? (
                        <img
                          src={board.coverImageUrl}
                          alt={board.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center">
                          <span className="text-3xl">✦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-gray-900 truncate">{board.name}</p>
                      {board.aesthetic && (
                        <p className="text-xs text-gray-400 mt-0.5">{board.aesthetic}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Trending on StyleBoard ── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {currentUser ? "Trending Now" : "Popular on StyleBoard"}
        </h2>
        {trendingItems.length === 0 ? (
          <div className="columns-2 md:columns-4 gap-4">
            {heroPhotos.slice(4).map((photo: any) => (
              <Link key={photo.id} href={`/details/${photo.id}`} className="block mb-4 break-inside-avoid">
                <img
                  src={photo.urls?.small}
                  alt={photo.alt_description || "fashion"}
                  className="rounded-2xl w-full hover:opacity-90 transition-opacity"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="columns-2 md:columns-4 gap-4">
            {trendingItems.map((item: any) => (
              <Link key={item._id} href={`/details/${item.unsplashId}`} className="block mb-4 break-inside-avoid">
                <div className="group rounded-2xl overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title || "fashion"}
                    className="w-full hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl">
                    <p className="text-white text-xs font-medium">
                      ♥ {item.saveCount} saves
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Anonymous CTA ── */}
      {!currentUser && (
        <section className="bg-black text-white py-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to build your <span className="text-rose-400">aesthetic?</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of fashion explorers and stylists curating their world.
            </p>
            <Link
              href="/register"
              className="bg-rose-400 hover:bg-rose-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors"
            >
              Join StyleBoard
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black text-gray-500 py-8 text-center text-xs">
        <div className="flex items-center justify-center gap-6 mb-3">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/search" className="hover:text-white transition-colors">Discover</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          {!currentUser && (
            <Link href="/register" className="hover:text-white transition-colors">Sign up</Link>
          )}
        </div>
        <p>© {new Date().getFullYear()} StyleBoard. Photos provided by{" "}
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Unsplash
          </a>.
        </p>
      </footer>
    </div>
  );
}
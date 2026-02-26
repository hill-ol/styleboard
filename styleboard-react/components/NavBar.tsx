"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/auth.service";

export default function NavBar() {
  const { currentUser, setCurrentUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-black">
          style<span className="text-rose-400">board</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-black transition-colors">
            Home
          </Link>
          <Link href="/search" className="text-sm text-gray-600 hover:text-black transition-colors">
            Discover
          </Link>
          {currentUser && (
            <Link href="/profile" className="text-sm text-gray-600 hover:text-black transition-colors">
              My Boards
            </Link>
          )}
          {currentUser?.role === "stylist" && (
            <Link href="/stylist/dashboard" className="text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors">
              Studio
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-semibold text-sm group-hover:bg-rose-200 transition-colors">
                  {currentUser.displayName?.[0]?.toUpperCase() ||
                    currentUser.username[0].toUpperCase()}
                </div>
                <span className="hidden md:block text-sm text-gray-700 group-hover:text-black transition-colors">
                  {currentUser.displayName || currentUser.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
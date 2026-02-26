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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream border-b border-dusty-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-warm-900">
          style<span className="text-dusty-400">board</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-warm-900/60 hover:text-warm-900 transition-colors">
            Home
          </Link>
          <Link href="/search" className="text-sm text-warm-900/60 hover:text-warm-900 transition-colors">
            Discover
          </Link>
          {currentUser && (
            <Link href="/profile" className="text-sm text-warm-900/60 hover:text-warm-900 transition-colors">
              My Boards
            </Link>
          )}
          {currentUser?.role === "stylist" && (
            <Link href="/stylist/dashboard" className="text-sm text-dusty-500 hover:text-dusty-600 font-medium transition-colors">
              Studio
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-dusty-100 flex items-center justify-center text-dusty-500 font-semibold text-sm group-hover:bg-dusty-200 transition-colors">
                  {currentUser.displayName?.[0]?.toUpperCase() ||
                    currentUser.username[0].toUpperCase()}
                </div>
                <span className="hidden md:block text-sm text-warm-900/70 group-hover:text-warm-900 transition-colors">
                  {currentUser.displayName || currentUser.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-warm-900/50 hover:text-warm-900 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-warm-900/60 hover:text-warm-900 transition-colors">
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm bg-dusty-400 text-white px-4 py-2 rounded-full hover:bg-dusty-500 transition-colors"
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
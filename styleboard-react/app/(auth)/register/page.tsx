"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "../../../services/auth.service";
import { useAuth } from "../../../context/AuthContext";

const AESTHETICS = [
  "Y2K", "Dark Academia", "Cottagecore", "Streetwear",
  "Minimalist", "Vintage", "Grunge", "Boho", "Clean Girl", "Old Money",
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "explorer",
    aesthetics: [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();
  const router = useRouter();

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleAesthetic = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      aesthetics: prev.aesthetics.includes(tag)
        ? prev.aesthetics.filter((a) => a !== tag)
        : [...prev.aesthetics, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      const user = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setCurrentUser(user);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center p-16">
        <div className="text-white max-w-sm">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            style<span className="text-rose-400">board</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Join a community of fashion explorers and stylists. Build boards, share lookbooks, and define your aesthetic.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
          <p className="text-gray-500 mb-8">
            Already have an account?{" "}
            <Link href="/login" className="text-rose-500 hover:text-rose-600 font-medium">
              Log in
            </Link>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
              />
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "explorer", label: "Explorer", desc: "Browse & save inspiration" },
                  { value: "stylist", label: "Stylist", desc: "Create & share lookbooks" },
                ].map((r) => (
                  <label
                    key={r.value}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                      form.role === r.value
                        ? "border-rose-400 bg-rose-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={(e) => update("role", e.target.value)}
                      className="sr-only"
                    />
                    <div className="font-semibold text-sm text-gray-900">{r.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{r.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Aesthetic tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your aesthetics{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AESTHETICS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleAesthetic(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      form.aesthetics.includes(tag)
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
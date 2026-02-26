"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PrivacyBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("sb_privacy_accepted");
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("sb_privacy_accepted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
      <p className="text-sm text-gray-300 max-w-2xl">
        StyleBoard uses session cookies to keep you logged in. By continuing, you agree to our{" "}
        <Link href="/privacy" className="text-rose-400 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="flex gap-3 flex-shrink-0">
        <Link
          href="/privacy"
          className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
        >
          Learn more
        </Link>
        <button
          onClick={handleAccept}
          className="bg-rose-400 hover:bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import PrivacyBanner from "../components/PrivacyBanner";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StyleBoard",
  description: "Discover and curate fashion inspiration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
          <NavBar />
          <main className="pt-16">
            {children}
          </main>
          <PrivacyBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
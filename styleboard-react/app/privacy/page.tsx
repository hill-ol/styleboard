import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-black transition-colors mb-8 inline-block"
        >
          ← Back to StyleBoard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>When you create an account on StyleBoard, we collect your username, email address, and password (stored as a hashed value). You may optionally provide a display name, bio, and aesthetic preferences. We do not collect payment information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information you provide to operate and improve StyleBoard, including to authenticate your account, display your profile to other users, and personalize your experience based on your stated aesthetic preferences.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Information Visible to Others</h2>
            <p>Your username, display name, bio, aesthetic tags, public boards, and lookbooks are visible to all users including those who are not logged in. Your email address and private boards are only visible to you when logged in.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p>StyleBoard uses the Unsplash API to display fashion photography. Images displayed in StyleBoard are hosted by Unsplash and subject to the Unsplash Terms of Service and Privacy Policy. We do not share your personal data with Unsplash.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookies and Sessions</h2>
            <p>StyleBoard uses session cookies to keep you logged in across page visits. These cookies are stored in your browser and expire after 24 hours of inactivity. We do not use advertising cookies or third-party tracking.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Retention</h2>
            <p>Your account and all associated data (boards, saved items, comments) are retained until you delete your account. You may contact us at any time to request deletion of your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify registered users of significant changes by updating the date at the top of this page.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact</h2>
            <p>If you have any questions about this privacy policy, please reach out through the StyleBoard platform.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
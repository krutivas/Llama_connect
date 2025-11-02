import Link from 'next/link';

/**
 * Home page - Marketing landing page
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-primary-600">
          ?? Llama Connect
        </div>
        <div className="space-x-4">
          <Link
            href="/pricing"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Pricing
          </Link>
          <Link
            href="/signin"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <div className="text-7xl mb-4">??</div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Strengthen Your Bond with
            <span className="text-primary-600"> Llama Connect</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover meaningful activities designed to bring parents and children
            closer together. Build memories that last a lifetime.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signin"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/pricing"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-primary-600"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">??</div>
            <h3 className="text-xl font-semibold mb-2">Creative Activities</h3>
            <p className="text-gray-600">
              Engage in fun, creative projects that spark imagination and joy.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">??</div>
            <h3 className="text-xl font-semibold mb-2">Deep Conversations</h3>
            <p className="text-gray-600">
              Prompts and activities designed to foster meaningful dialogue.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">??</div>
            <h3 className="text-xl font-semibold mb-2">Goal-Oriented</h3>
            <p className="text-gray-600">
              Build skills and memories while having fun together.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-primary-600 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Connect with Your Child?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of families building stronger bonds today.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
          >
            Start Your Journey
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-24 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2025 Llama Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

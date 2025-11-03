'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Sign-in page - Simple email-based authentication
 * No actual email sending - just creates session immediately
 */
export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Authentication failed');
      }

      // Redirect to pricing page after successful sign-in
      router.push('/pricing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl">
            ??
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Welcome to Llama Connect
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to access your bonding activities
          </p>
        </div>

        {/* Sign-in Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              New here?{' '}
              <Link href="/pricing" className="text-primary-600 hover:underline">
                View pricing plans
              </Link>
            </p>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">Demo Mode</p>
          <p>
            This is a simplified authentication for demo purposes. Enter any email
            to sign in instantly - no password or verification needed.
          </p>
        </div>
      </div>
    </div>
  );
}

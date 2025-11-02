'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Pricing page - Display subscription plans and handle checkout
 */
export default function PricingPage() {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);
  const [error, setError] = useState('');

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    setLoading(plan);
    setError('');

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          ?? Llama Connect
        </Link>
        <Link
          href="/signin"
          className="text-gray-600 hover:text-gray-900 transition"
        >
          Sign In
        </Link>
      </nav>

      {/* Pricing Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Start building stronger bonds with your child today
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 text-red-600 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 hover:border-primary-400 transition">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Monthly Plan
              </h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-primary-600">$9.99</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">?</span>
                <span className="text-gray-700">
                  Access to all bonding activities
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">?</span>
                <span className="text-gray-700">New activities added weekly</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">?</span>
                <span className="text-gray-700">Progress tracking</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">?</span>
                <span className="text-gray-700">Cancel anytime</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading !== null}
              className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading === 'monthly' ? 'Loading...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Annual Plan */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-primary-500 p-8 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                BEST VALUE
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Annual Plan
              </h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-primary-600">$99</span>
                <span className="text-gray-600">/year</span>
              </div>
              <p className="text-green-600 font-semibold mt-2">
                Save $20 per year!
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">?</span>
                <span className="text-gray-700">
                  Access to all bonding activities
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">?</span>
                <span className="text-gray-700">New activities added weekly</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">?</span>
                <span className="text-gray-700">Progress tracking</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">?</span>
                <span className="text-gray-700">Priority support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">?</span>
                <span className="text-gray-700">Exclusive annual member perks</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('annual')}
              disabled={loading !== null}
              className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
            >
              {loading === 'annual' ? 'Loading...' : 'Subscribe Annually'}
            </button>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All plans include a 7-day money-back guarantee. Questions?{' '}
            <a href="mailto:support@llamaconnect.com" className="text-primary-600 hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

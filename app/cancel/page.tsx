import Link from 'next/link';

/**
 * Cancel page - Shown when user cancels Stripe Checkout
 */
export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
        {/* Cancel Icon */}
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-100 rounded-full p-6 mb-4">
            <svg
              className="w-16 h-16 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Checkout Canceled
          </h1>
          <p className="text-lg text-gray-600">
            No worries! Your subscription was not activated.
          </p>
        </div>

        {/* Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700 text-center">
            You can return to pricing and subscribe whenever you&apos;re ready to start
            building stronger bonds with your child.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <Link
            href="/pricing"
            className="block w-full bg-primary-600 text-white text-center py-4 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            View Pricing Plans
          </Link>
          <Link
            href="/"
            className="block w-full bg-white text-gray-700 text-center py-4 rounded-lg font-semibold hover:bg-gray-50 transition border border-gray-300"
          >
            Return to Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Questions about our plans?{' '}
            <a
              href="mailto:support@llamaconnect.com"
              className="text-primary-600 hover:underline"
            >
              We&apos;re here to help
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

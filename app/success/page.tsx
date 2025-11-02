import Link from 'next/link';
import { stripe } from '@/lib/stripe';

/**
 * Success page - Shown after successful Stripe Checkout
 * Fetches session details to show subscription info
 */
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  let sessionData = null;
  let subscriptionData = null;

  if (sessionId) {
    try {
      // Fetch checkout session details
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      sessionData = session;

      // Fetch subscription details if available
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        subscriptionData = subscription;
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 rounded-full p-6 mb-4">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Llama Connect! ??
          </h1>
          <p className="text-xl text-gray-600">
            Your subscription is now active
          </p>
        </div>

        {/* Subscription Details */}
        {subscriptionData && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Subscription Details
            </h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold capitalize">
                  {subscriptionData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Next billing date:</span>
                <span className="font-semibold">
                  {new Date(
                    subscriptionData.current_period_end * 1000
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* What&apos;s Next */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What&apos;s Next?
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-primary-600 mr-3 text-xl">?</span>
              <span className="text-gray-700">
                Explore dozens of bonding activities designed for you and your child
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-3 text-xl">?</span>
              <span className="text-gray-700">
                Track your progress and build lasting memories together
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-3 text-xl">?</span>
              <span className="text-gray-700">
                New activities are added every week
              </span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <Link
            href="/app/activities"
            className="block w-full bg-primary-600 text-white text-center py-4 rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg"
          >
            Start Your First Activity
          </Link>
          <Link
            href="/account"
            className="block w-full bg-white text-primary-600 text-center py-4 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-primary-600"
          >
            Manage Your Account
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Need help?{' '}
            <a
              href="mailto:support@llamaconnect.com"
              className="text-primary-600 hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

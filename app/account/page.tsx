import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Account page - Show user subscription details and management options
 */
export default async function AccountPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/signin');
  }

  const subscription = user.subscription;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            ?? Llama Connect
          </Link>
          <Link
            href="/app/activities"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Activities
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Account Settings
        </h1>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Account Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">User ID</span>
              <span className="font-mono text-sm text-gray-500">{user.id}</span>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subscription Details
          </h2>
          
          {subscription ? (
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Status</span>
                <span
                  className={`font-medium capitalize px-3 py-1 rounded-full text-sm ${
                    subscription.status === 'active' || subscription.status === 'trialing'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {subscription.status}
                </span>
              </div>
              
              {subscription.currentPeriodEnd && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">
                    {subscription.status === 'active' || subscription.status === 'trialing'
                      ? 'Next Billing Date'
                      : 'Subscription Ends'}
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {subscription.stripeSubscriptionId && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subscription ID</span>
                  <span className="font-mono text-sm text-gray-500">
                    {subscription.stripeSubscriptionId}
                  </span>
                </div>
              )}

              {/* Manage Billing Button (Stripe Customer Portal - optional feature) */}
              {user.stripeCustomerId && (
                <div className="pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Stripe Customer Portal integration is a nice-to-have
                      feature. You can manage your subscription directly in the{' '}
                      <a
                        href="https://dashboard.stripe.com/test/customers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Stripe Dashboard
                      </a>
                      .
                    </p>
                  </div>
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Manage Billing (Coming Soon)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You don&apos;t have an active subscription yet.
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                View Pricing Plans
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Links
          </h2>
          <div className="space-y-3">
            <Link
              href="/app/activities"
              className="block py-3 px-4 rounded-lg hover:bg-gray-50 transition border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  Browse Activities
                </span>
                <span className="text-primary-600">?</span>
              </div>
            </Link>
            {!subscription && (
              <Link
                href="/pricing"
                className="block py-3 px-4 rounded-lg hover:bg-gray-50 transition border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Subscribe Now
                  </span>
                  <span className="text-primary-600">?</span>
                </div>
              </Link>
            )}
            <a
              href="mailto:support@llamaconnect.com"
              className="block py-3 px-4 rounded-lg hover:bg-gray-50 transition border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  Contact Support
                </span>
                <span className="text-primary-600">?</span>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

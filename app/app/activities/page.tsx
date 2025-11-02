import Link from 'next/link';
import { getCurrentUser, hasActiveSubscription } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Activities page (GATED) - Main content area for subscribers
 * Shows bonding activities if user has active subscription
 */
export default async function ActivitiesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/signin');
  }

  const isActive = await hasActiveSubscription();

  // If no active subscription, show locked state
  if (!isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <nav className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              ?? Llama Connect
            </Link>
            <div className="text-sm text-gray-600">
              {user.email}
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-200 text-center">
            <div className="text-6xl mb-6">??</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Subscription Required
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              You need an active subscription to access bonding activities.
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              View Pricing Plans
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Active subscription - show activities
  const activities = [
    {
      id: 1,
      title: 'Gratitude Journaling',
      duration: '10 min',
      emoji: '??',
      description: 'Share three things you\'re each grateful for today',
      difficulty: 'Easy',
    },
    {
      id: 2,
      title: 'Build a Fort',
      duration: '30 min',
      emoji: '??',
      description: 'Create a cozy fort using blankets, pillows, and imagination',
      difficulty: 'Easy',
    },
    {
      id: 3,
      title: 'Nature Scavenger Hunt',
      duration: '45 min',
      emoji: '??',
      description: 'Find 10 natural items on your outdoor adventure',
      difficulty: 'Medium',
    },
    {
      id: 4,
      title: 'Cooking Together',
      duration: '60 min',
      emoji: '?????',
      description: 'Prepare a simple recipe as a team',
      difficulty: 'Medium',
    },
    {
      id: 5,
      title: 'Story Time Swap',
      duration: '20 min',
      emoji: '??',
      description: 'Take turns reading or making up stories',
      difficulty: 'Easy',
    },
    {
      id: 6,
      title: 'Art Project',
      duration: '40 min',
      emoji: '??',
      description: 'Create a collaborative painting or drawing',
      difficulty: 'Easy',
    },
    {
      id: 7,
      title: 'Memory Lane Walk',
      duration: '30 min',
      emoji: '??',
      description: 'Visit a meaningful place and share memories',
      difficulty: 'Easy',
    },
    {
      id: 8,
      title: 'Goal Setting Session',
      duration: '25 min',
      emoji: '??',
      description: 'Set personal and family goals together',
      difficulty: 'Medium',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            ?? Llama Connect
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Account
            </Link>
            <div className="text-sm text-gray-600">
              {user.email}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bonding Activities
          </h1>
          <p className="text-lg text-gray-600">
            Choose an activity to strengthen your connection with your child
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer group"
            >
              <div className="text-4xl mb-4">{activity.emoji}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition">
                {activity.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {activity.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">?? {activity.duration}</span>
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                  {activity.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-8 border border-primary-200">
          <div className="flex items-center gap-4">
            <div className="text-4xl">?</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                More Activities Coming Soon!
              </h3>
              <p className="text-gray-600">
                We add new bonding activities every week. Check back often for fresh
                ideas to connect with your child.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

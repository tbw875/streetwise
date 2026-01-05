import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, ChevronRight, Lightbulb } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import SuggestForm from '@/components/SuggestForm';

export default async function SuggestPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/suggest');
  }

  // Fetch categories for the form
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Suggest a Project</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <Lightbulb className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Suggest a Transportation Project
              </h1>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Have an idea for improving Seattle's streets? Share your suggestion with the
            community. Your idea could help shape the future of our transportation infrastructure.
          </p>
        </div>

        {/* Info Box */}
        <div className="card p-6 mb-8 bg-blue-50 border border-blue-200">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">
            What makes a good suggestion?
          </h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about the location and what you'd like to see</li>
            <li>• Explain the problem your suggestion would solve</li>
            <li>• Include details about affected streets or areas</li>
            <li>• Choose a relevant category to help others find your idea</li>
          </ul>
        </div>

        {/* Form */}
        <div className="card p-6 sm:p-8">
          <SuggestForm categories={categories || []} />
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Your suggestion will be marked as "Proposed" and visible to the community.
            Other users can vote and comment on your idea.
          </p>
        </div>
      </main>
    </div>
  );
}

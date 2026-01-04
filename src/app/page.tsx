import Link from 'next/link';
import { MapPin, Users, Calendar, MessageCircle, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Streetwise</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/map" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Explore Map
            </Link>
            <Link 
              href="/projects" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Projects
            </Link>
            <Link 
              href="/login" 
              className="btn-primary btn-sm"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Shape Seattle&apos;s{' '}
              <span className="text-gradient">Streets</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Track ongoing transportation projects, suggest improvements for your 
              neighborhood, and engage with the community to make Seattle&apos;s 
              streets safer for everyone.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/map" className="btn-primary btn-lg">
                Explore the Map
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/projects" className="btn-outline btn-lg">
                View All Projects
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brand-100 opacity-50 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to stay informed
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From official SDOT projects to community suggestions, Streetwise 
              brings it all together in one place.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<MapPin className="h-6 w-6" />}
              title="Interactive Map"
              description="See all projects and suggestions on an interactive map of Seattle."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Community Input"
              description="Submit your own suggestions and vote on others' ideas."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Stay Updated"
              description="Track deadlines, meetings, and construction timelines."
            />
            <FeatureCard
              icon={<MessageCircle className="h-6 w-6" />}
              title="Join the Discussion"
              description="Comment on projects and engage with your neighbors."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to make a difference?
              </h2>
              <p className="mt-2 text-brand-100">
                Sign up to submit suggestions and join the conversation.
              </p>
            </div>
            <Link 
              href="/signup" 
              className="btn btn-lg bg-white text-brand-600 hover:bg-brand-50"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Streetwise</span>
            </div>
            <p className="text-sm text-gray-500">
              A community project for Seattle transportation advocacy.
            </p>
            <div className="flex gap-6">
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
                About
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="card p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

import Link from "next/link";
import {
  GraduationCap,
  MessageSquare,
  FileText,
  Calendar,
  ShoppingBag,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Campus Feed",
    description: "One feed for announcements, discussions, lost & found — replacing 10+ WhatsApp groups",
  },
  {
    icon: FileText,
    title: "Resource Sharing",
    description: "Notes, PYQs, assignments organized by branch, semester & subject",
  },
  {
    icon: Calendar,
    title: "Events Hub",
    description: "Discover campus events, hackathons, workshops. RSVP in one tap",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy & sell textbooks, electronics, hostel stuff — verified campus-only",
  },
  {
    icon: Users,
    title: "Clubs & Societies",
    description: "Join clubs, get updates, manage memberships — all in one place",
  },
  {
    icon: CheckCircle2,
    title: "Verified Community",
    description: "College email verification ensures a trusted, spam-free campus network",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32 text-center">
          <div className="flex justify-center mb-6">
            <GraduationCap className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
            Your Campus.
            <br />
            <span className="text-blue-600">One Platform.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Stop juggling WhatsApp, LinkedIn, Drive & Instagram. Campusly brings your
            entire college experience — feed, resources, events, marketplace — into one
            verified campus community.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 dark:border-gray-600 px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Free for students. Sign up with your college email.
          </p>
        </div>
      </header>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Everything your campus needs
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Built by students, for students. One app to replace the chaos of
            scattered groups and platforms.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800/50"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 dark:bg-blue-700">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to unite your campus?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join hundreds of students already on Campusly. It takes 30 seconds.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-colors"
          >
            Create Your Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Campusly
            </span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 Campusly. Built with ❤️ for campus communities.
          </p>
        </div>
      </footer>
    </div>
  );
}

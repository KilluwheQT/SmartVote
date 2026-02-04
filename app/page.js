import Link from "next/link";
import { Vote, Shield, BarChart3, Users, CheckCircle, Lock, Globe, Smartphone, Eye, HelpCircle } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: "Secure Voting",
      description: "End-to-end encryption ensures your vote remains private and tamper-proof"
    },
    {
      icon: BarChart3,
      title: "Real-time Results",
      description: "Watch live voter turnout and get instant results when elections close"
    },
    {
      icon: Users,
      title: "Easy Management",
      description: "Import voters, manage candidates, and control elections with ease"
    },
    {
      icon: CheckCircle,
      title: "Transparent Auditing",
      description: "Complete audit trails and vote verification receipts for full transparency"
    },
    {
      icon: Lock,
      title: "Two-Factor Auth",
      description: "Enhanced security with 2FA to protect voter accounts"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Vote from any device with our responsive, accessible interface"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <Vote className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">SmartVote</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link 
                href="/live" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Live Results
              </Link>
              <Link 
                href="/help" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium flex items-center gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </Link>
              <Link 
                href="/login" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content" className="pt-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Trusted by 100+ Educational Institutions
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Smart Online Voting<br />
              <span className="text-blue-600">for Your School</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Secure, transparent, and accessible voting platform for student government elections, 
              department elections, and club elections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                Get Started
              </Link>
              <Link 
                href="/live" 
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg border border-gray-200 dark:border-gray-700 transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Fair Elections
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built with security, transparency, and accessibility at its core
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-blue-600 rounded-3xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Elections?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of schools already using SmartVote for secure, transparent elections.
            </p>
            <Link 
              href="/register" 
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-semibold text-lg transition-colors"
            >
              Get Started Today
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Vote className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-gray-900 dark:text-white">SmartVote</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <Link href="/live" className="hover:text-gray-900 dark:hover:text-white">Live Results</Link>
                <Link href="/help" className="hover:text-gray-900 dark:hover:text-white">Help & Support</Link>
                <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">Privacy</Link>
                <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">Terms</Link>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                © {new Date().getFullYear()} SmartVote. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

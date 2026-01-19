import Link from 'next/link';
import { Vote } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In - SmartVote',
  description: 'Sign in to your SmartVote account'
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Vote className="w-10 h-10 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">SmartVote</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to access your voting dashboard
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

      {/* Right side - Image/Info */}
      <div className="hidden lg:flex lg:flex-1 bg-blue-600 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h2 className="text-3xl font-bold mb-4">
            Your Voice Matters
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Participate in secure, transparent elections. Every vote counts in shaping your institution&apos;s future.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">1</span>
              </div>
              <span>Sign in with your credentials</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">2</span>
              </div>
              <span>View active elections</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">3</span>
              </div>
              <span>Cast your secure vote</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Vote } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register - SmartVote',
  description: 'Create your SmartVote account'
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Info */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h2 className="text-3xl font-bold mb-4">
            Join SmartVote Today
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Register to participate in your institution&apos;s elections. Make your voice heard through secure, transparent voting.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <span>Secure account with two-factor authentication</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <span>Vote in student government, department, and club elections</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <span>Track your voting history and verify your votes</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <span>Run as a candidate with admin approval</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Vote className="w-10 h-10 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">SmartVote</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Register to start participating in elections
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

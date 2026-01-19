'use client';

import Link from 'next/link';
import { ArrowLeft, Vote } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <Vote className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: January 2026
          </p>
        </div>

        <Card>
          <Card.Body className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-0">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              By accessing and using SmartVote, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              2. Eligibility
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              SmartVote is intended for use by authorized students, faculty, and staff of participating educational institutions. You must be a registered member of your institution to use this service. You must provide accurate and complete information during registration.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              3. User Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. You may not share your login credentials with others or allow others to vote on your behalf.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              4. Voting Rules
            </h2>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>Each eligible voter may cast only one vote per election</li>
              <li>Votes are final and cannot be changed once submitted</li>
              <li>Attempting to vote multiple times is strictly prohibited</li>
              <li>Vote buying, selling, or coercion is prohibited</li>
              <li>Impersonating another voter is a serious offense</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              5. Election Integrity
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              SmartVote employs encryption and security measures to protect the integrity of elections. Any attempt to manipulate, hack, or interfere with the voting system is strictly prohibited and may result in disciplinary action and legal consequences.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              6. Candidate Conduct
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Candidates must conduct their campaigns in accordance with institutional guidelines. Campaign materials must be truthful and not defamatory. Candidates may not use the platform to harass or intimidate voters or other candidates.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              7. Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your use of SmartVote is also governed by our Privacy Policy. We are committed to protecting your personal information and maintaining the anonymity of your votes.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              8. Intellectual Property
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              All content, features, and functionality of SmartVote are owned by the platform and are protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              SmartVote is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              10. Termination
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              11. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              12. Contact Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have questions about these Terms, please contact us at:
              <br />
              Email: legal@smartvote.edu
              <br />
              Address: Student Affairs Office, Main Campus
            </p>
          </Card.Body>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/privacy" className="text-blue-600 hover:underline">
            View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

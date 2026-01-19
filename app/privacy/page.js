'use client';

import Link from 'next/link';
import { ArrowLeft, Vote } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: January 2026
          </p>
        </div>

        <Card>
          <Card.Body className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-0">
              1. Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              SmartVote ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our online voting platform.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              2. Information We Collect
            </h2>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Personal Information
            </h3>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>Name and student ID</li>
              <li>Email address</li>
              <li>Grade level, section, and department</li>
              <li>Profile photo (optional)</li>
              <li>Account credentials</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Voting Information
            </h3>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>Voting participation status (whether you voted, not who you voted for)</li>
              <li>Encrypted vote selections (cannot be traced back to you)</li>
              <li>Vote timestamp</li>
              <li>Vote verification receipt</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Technical Information
            </h3>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Access times and dates</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              3. How We Use Your Information
            </h2>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>To verify your eligibility to vote</li>
              <li>To prevent duplicate voting</li>
              <li>To provide election results and statistics</li>
              <li>To send election-related notifications</li>
              <li>To maintain security and prevent fraud</li>
              <li>To improve our services</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              4. Vote Anonymity
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Your vote selections are anonymous.</strong> While we record that you participated in an election, your actual vote choices are encrypted using industry-standard AES-256 encryption. This means:
            </p>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>No one can see who you voted for, including administrators</li>
              <li>Your vote cannot be traced back to your identity</li>
              <li>Only aggregate results are published</li>
              <li>Vote receipts verify your vote was counted without revealing your choices</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              5. Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We implement robust security measures to protect your data:
            </p>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>End-to-end encryption for vote data</li>
              <li>Secure HTTPS connections</li>
              <li>Two-factor authentication option</li>
              <li>Regular security audits</li>
              <li>Access controls and audit logging</li>
              <li>Secure data storage with Firebase</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              6. Data Sharing
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>Your educational institution (for verification purposes)</li>
              <li>Election administrators (participation status only)</li>
              <li>Service providers (Firebase, hosting services)</li>
              <li>Legal authorities (when required by law)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              7. Data Retention
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We retain your data for the following periods:
            </p>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>Account information: Until account deletion or graduation</li>
              <li>Voting records: 5 years for audit purposes</li>
              <li>Audit logs: 2 years</li>
              <li>Election results: Permanently archived</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              8. Your Rights
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You have the right to:
            </p>
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account</li>
              <li>Opt out of non-essential notifications</li>
              <li>Export your data</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              9. Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We use essential cookies for authentication and session management. We do not use tracking cookies for advertising purposes.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              10. Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              SmartVote is intended for use by students of all ages within educational institutions. We collect only the minimum information necessary for the voting process.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              11. Changes to This Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              12. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@smartvote.edu
              <br />
              Data Protection Officer: dpo@smartvote.edu
            </p>
          </Card.Body>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/terms" className="text-blue-600 hover:underline">
            View Terms and Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}

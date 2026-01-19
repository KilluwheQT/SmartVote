'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Vote,
  ArrowLeft,
  Send
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const faqs = [
  {
    question: 'How do I vote in an election?',
    answer: 'Once logged in, go to the Elections page, select an active election you\'re eligible for, review the candidates, and cast your vote. You\'ll receive a receipt code to verify your vote was recorded.'
  },
  {
    question: 'How do I verify my vote was counted?',
    answer: 'After voting, you\'ll receive a unique receipt code. Go to "My Votes" page and use the verification feature to confirm your vote was recorded in the system.'
  },
  {
    question: 'Can I change my vote after submitting?',
    answer: 'No, once a vote is submitted, it cannot be changed. This ensures the integrity of the election. Please review your selections carefully before confirming.'
  },
  {
    question: 'Why can\'t I see certain elections?',
    answer: 'Elections may have eligibility criteria based on grade level, department, or section. You can only see and vote in elections you\'re eligible for.'
  },
  {
    question: 'How do I report a technical issue?',
    answer: 'Use the contact form below or email our support team directly. Include details about the issue, your browser, and any error messages you see.'
  },
  {
    question: 'Is my vote anonymous?',
    answer: 'Yes, your vote is encrypted and stored securely. While we track that you voted to prevent duplicate votes, your actual selections are encrypted and cannot be traced back to you.'
  },
  {
    question: 'What happens if the election ends while I\'m voting?',
    answer: 'If you started voting before the deadline, you\'ll have a grace period to complete your vote. However, we recommend voting early to avoid any issues.'
  },
  {
    question: 'How do I become a candidate?',
    answer: 'Candidates are added by election administrators. Contact your student affairs office or election officer if you\'re interested in running for a position.'
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message sent! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

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
            Help & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find answers to common questions or contact our support team
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <Mail className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Get help via email
            </p>
            <a href="mailto:support@smartvote.edu" className="text-blue-600 hover:underline">
              support@smartvote.edu
            </a>
          </Card>

          <Card className="text-center p-6">
            <Phone className="w-10 h-10 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Mon-Fri, 8AM-5PM
            </p>
            <a href="tel:+1234567890" className="text-blue-600 hover:underline">
              (123) 456-7890
            </a>
          </Card>

          <Card className="text-center p-6">
            <MessageSquare className="w-10 h-10 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Chat with support
            </p>
            <span className="text-gray-500">Coming Soon</span>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="mb-12">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </h2>
          </Card.Header>
          <Card.Body className="divide-y divide-gray-200 dark:divide-gray-700">
            {faqs.map((faq, index) => (
              <div key={index} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </Card.Body>
        </Card>

        {/* Contact Form */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Contact Us
            </h2>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <Button type="submit" loading={sending}>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Hash, Building, GraduationCap } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { GRADE_LEVELS } from '@/lib/constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    gradeLevel: '',
    section: '',
    department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);

    const result = await register(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      studentId: formData.studentId,
      gradeLevel: formData.gradeLevel,
      section: formData.section,
      department: formData.department
    });

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Failed to register');
    }

    setLoading(false);
  };

  const gradeLevelOptions = GRADE_LEVELS.map(level => ({
    value: level.toLowerCase(),
    label: level
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          className="pl-10"
          required
        />
      </div>

      <div className="relative">
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          name="studentId"
          placeholder="Student ID"
          value={formData.studentId}
          onChange={handleChange}
          className="pl-10"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          name="gradeLevel"
          value={formData.gradeLevel}
          onChange={handleChange}
          options={gradeLevelOptions}
          placeholder="Grade Level"
          required
        />
        <Input
          name="section"
          placeholder="Section"
          value={formData.section}
          onChange={handleChange}
          required
        />
      </div>

      <div className="relative">
        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          className="pl-10"
          required
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="pl-10 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="pl-10"
          required
        />
      </div>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          I agree to the{' '}
          <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </span>
      </label>

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        size="lg"
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;

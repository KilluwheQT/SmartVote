'use client';

import { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Globe, 
  Type, 
  Bell, 
  Shield,
  Eye,
  Smartphone
} from 'lucide-react';
import { useThemeStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { theme, fontSize, language, setTheme, setFontSize, setLanguage } = useThemeStore();
  const [notifications, setNotifications] = useState({
    electionStart: true,
    electionEnd: true,
    votingReminder: true,
    results: true,
    systemUpdates: false
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preference updated');
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'tl', label: 'Filipino' }
  ];

  const fontSizeOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' }
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your SmartVote experience</p>
      </div>

      {/* Appearance */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Appearance
          </h2>
        </Card.Header>
        <Card.Body className="space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Sun className={`w-6 h-6 mx-auto mb-2 ${theme === 'light' ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${theme === 'light' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  Light
                </p>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Moon className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  Dark
                </p>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Type className="w-4 h-4 inline mr-2" />
              Text Size
            </label>
            <Select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              options={fontSizeOptions}
            />
            <p className="text-sm text-gray-500 mt-2">
              Increase text size for better readability
            </p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Globe className="w-4 h-4 inline mr-2" />
              Language
            </label>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={languageOptions}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Notifications */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          {[
            { key: 'electionStart', label: 'Election Start', description: 'Get notified when a new election begins' },
            { key: 'electionEnd', label: 'Election Ending', description: 'Reminder before an election closes' },
            { key: 'votingReminder', label: 'Voting Reminders', description: 'Remind me if I haven\'t voted yet' },
            { key: 'results', label: 'Results Announcement', description: 'Notify when election results are available' },
            { key: 'systemUpdates', label: 'System Updates', description: 'News about SmartVote features and maintenance' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
              <button
                onClick={() => handleNotificationChange(item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[item.key] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Security */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Active Sessions</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage devices where you&apos;re logged in</p>
            </div>
            <Button variant="outline" size="sm">
              View
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Accessibility */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Accessibility
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Screen Reader Support</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Optimized for assistive technologies</p>
              </div>
              <span className="text-sm text-green-600 font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Keyboard Navigation</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Navigate using keyboard shortcuts</p>
              </div>
              <span className="text-sm text-green-600 font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">High Contrast Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Increase visual contrast for better visibility</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

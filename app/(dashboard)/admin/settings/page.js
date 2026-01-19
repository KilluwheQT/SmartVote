'use client';

import { useState } from 'react';
import { 
  Settings, 
  Database, 
  Shield, 
  Bell,
  Globe,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { SuperAdminGuard } from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';

function SystemSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'SmartVote',
    siteDescription: 'School Online Voting System',
    maintenanceMode: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireEmailVerification: true,
    require2FA: false,
    allowSelfRegistration: true,
    defaultLanguage: 'en',
    timezone: 'UTC'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    // In production, save to Firestore
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully');
    setLoading(false);
  };

  const handleBackup = async () => {
    toast.info('Backup functionality would be implemented with Firebase Admin SDK');
  };

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
    { value: 'Asia/Manila', label: 'Philippine Time' },
    { value: 'Asia/Singapore', label: 'Singapore Time' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'tl', label: 'Filipino' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackup}>
            <Database className="w-4 h-4 mr-2" />
            Backup Data
          </Button>
          <Button onClick={handleSave} loading={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Warning */}
      {settings.maintenanceMode && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Maintenance Mode Active</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Users cannot access the voting system while maintenance mode is enabled.</p>
          </div>
        </div>
      )}

      {/* General Settings */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            General Settings
          </h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          <Input
            label="Site Name"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
          />
          <Input
            label="Site Description"
            name="siteDescription"
            value={settings.siteDescription}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Default Language"
              name="defaultLanguage"
              value={settings.defaultLanguage}
              onChange={handleChange}
              options={languageOptions}
            />
            <Select
              label="Timezone"
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              options={timezoneOptions}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Security Settings */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Session Timeout (minutes)"
              name="sessionTimeout"
              type="number"
              value={settings.sessionTimeout}
              onChange={handleChange}
            />
            <Input
              label="Max Login Attempts"
              name="maxLoginAttempts"
              type="number"
              value={settings.maxLoginAttempts}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Require Email Verification</span>
                <p className="text-sm text-gray-500">Users must verify their email before voting</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="require2FA"
                checked={settings.require2FA}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Require Two-Factor Authentication</span>
                <p className="text-sm text-gray-500">All users must enable 2FA to vote</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="allowSelfRegistration"
                checked={settings.allowSelfRegistration}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Allow Self Registration</span>
                <p className="text-sm text-gray-500">Users can register themselves (vs admin-only import)</p>
              </div>
            </label>
          </div>
        </Card.Body>
      </Card>

      {/* System Maintenance */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            System Maintenance
          </h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Maintenance Mode</span>
              <p className="text-sm text-gray-500">Temporarily disable access for all non-admin users</p>
            </div>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              <Database className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reset System
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* System Health */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            System Health
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Database</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Storage</p>
              <p className="text-xs text-gray-500">Operational</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Auth</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">API</p>
              <p className="text-xs text-gray-500">Healthy</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <SuperAdminGuard>
      <SystemSettings />
    </SuperAdminGuard>
  );
}

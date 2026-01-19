'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { createElection } from '@/lib/services/electionService';
import { useAuth } from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { ELECTION_TYPES, POSITIONS, GRADE_LEVELS } from '@/lib/constants';
import toast from 'react-hot-toast';

function CreateElection() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    startDate: '',
    endDate: '',
    positions: [],
    eligibilityCriteria: {
      gradeLevels: [],
      departments: [],
      sections: []
    }
  });
  const [newPosition, setNewPosition] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPosition = () => {
    if (newPosition && !formData.positions.includes(newPosition)) {
      setFormData(prev => ({
        ...prev,
        positions: [...prev.positions, newPosition]
      }));
      setNewPosition('');
    }
  };

  const handleRemovePosition = (position) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter(p => p !== position)
    }));
  };

  const handleGradeLevelToggle = (level) => {
    setFormData(prev => ({
      ...prev,
      eligibilityCriteria: {
        ...prev.eligibilityCriteria,
        gradeLevels: prev.eligibilityCriteria.gradeLevels.includes(level)
          ? prev.eligibilityCriteria.gradeLevels.filter(l => l !== level)
          : [...prev.eligibilityCriteria.gradeLevels, level]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.positions.length === 0) {
      toast.error('Please add at least one position');
      return;
    }

    setLoading(true);
    
    const electionData = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      totalVoters: 0,
      totalVotes: 0
    };

    const result = await createElection(electionData, user.uid);
    
    if (result.success) {
      toast.success('Election created successfully');
      router.push('/admin/elections');
    } else {
      toast.error(result.error || 'Failed to create election');
    }
    
    setLoading(false);
  };

  const typeOptions = Object.entries(ELECTION_TYPES).map(([key, value]) => ({
    value: value,
    label: key.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }));

  const positionOptions = POSITIONS.map(p => ({ value: p, label: p }));

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Election</h1>
        <p className="text-gray-600 dark:text-gray-400">Set up a new election campaign</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Basic Information</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <Input
              label="Election Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Student Government Election 2024"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the election..."
              />
            </div>

            <Select
              label="Election Type *"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={typeOptions}
              placeholder="Select type"
              required
            />
          </Card.Body>
        </Card>

        {/* Schedule */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Schedule</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date & Time *"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              <Input
                label="End Date & Time *"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </Card.Body>
        </Card>

        {/* Positions */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Positions</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="flex gap-2">
              <Select
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                options={positionOptions}
                placeholder="Select or type position"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddPosition}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.positions.map((position) => (
                <span
                  key={position}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  {position}
                  <button
                    type="button"
                    onClick={() => handleRemovePosition(position)}
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
            
            {formData.positions.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No positions added yet. Add positions that voters will vote for.
              </p>
            )}
          </Card.Body>
        </Card>

        {/* Eligibility */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Voter Eligibility</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Leave empty to allow all registered voters
            </p>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade Levels
              </label>
              <div className="flex flex-wrap gap-2">
                {GRADE_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleGradeLevelToggle(level.toLowerCase())}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.eligibilityCriteria.gradeLevels.includes(level.toLowerCase())
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Election
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewElectionPage() {
  return (
    <AdminGuard>
      <CreateElection />
    </AdminGuard>
  );
}

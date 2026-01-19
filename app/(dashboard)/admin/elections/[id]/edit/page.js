'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { ELECTION_TYPES, POSITIONS, GRADE_LEVELS } from '@/lib/constants';
import { logAuditAction } from '@/lib/services/auditService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function EditElection() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (params.id) {
      fetchElection();
    }
  }, [params.id]);

  const fetchElection = async () => {
    try {
      const electionDoc = await getDoc(doc(db, 'elections', params.id));
      if (electionDoc.exists()) {
        const data = electionDoc.data();
        setFormData({
          name: data.name || '',
          description: data.description || '',
          type: data.type || '',
          startDate: data.startDate ? format(data.startDate.toDate(), "yyyy-MM-dd'T'HH:mm") : '',
          endDate: data.endDate ? format(data.endDate.toDate(), "yyyy-MM-dd'T'HH:mm") : '',
          positions: data.positions || [],
          eligibilityCriteria: data.eligibilityCriteria || {
            gradeLevels: [],
            departments: [],
            sections: []
          }
        });
      } else {
        toast.error('Election not found');
        router.push('/admin/elections');
      }
    } catch (error) {
      console.error('Error fetching election:', error);
      toast.error('Failed to load election');
    } finally {
      setLoading(false);
    }
  };

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

    setSaving(true);
    
    try {
      await updateDoc(doc(db, 'elections', params.id), {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        positions: formData.positions,
        eligibilityCriteria: formData.eligibilityCriteria,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });

      await logAuditAction(user.uid, 'ELECTION_UPDATED', {
        electionId: params.id,
        electionName: formData.name
      });

      toast.success('Election updated successfully');
      router.push(`/admin/elections/${params.id}`);
    } catch (error) {
      console.error('Error updating election:', error);
      toast.error('Failed to update election');
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = Object.entries(ELECTION_TYPES).map(([key, value]) => ({
    value: value,
    label: key.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }));

  const positionOptions = POSITIONS.map(p => ({ value: p, label: p }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Election</h1>
        <p className="text-gray-600 dark:text-gray-400">Update election details</p>
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
              placeholder="e.g., Student Council Election 2026"
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
                rows={3}
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
          </Card.Body>
        </Card>

        {/* Eligibility */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Voter Eligibility</h2>
          </Card.Header>
          <Card.Body>
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

        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EditElectionPage() {
  return (
    <AdminGuard>
      <EditElection />
    </AdminGuard>
  );
}

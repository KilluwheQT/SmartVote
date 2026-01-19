'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Camera, User } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { ELECTION_STATUS, POSITIONS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';

export default function AddCandidatePage() {
  const router = useRouter();
  const photoInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [elections, setElections] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    electionId: '',
    name: '',
    email: '',
    studentId: '',
    department: '',
    gradeLevel: '',
    position: '',
    platform: '',
    slogan: ''
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const q = query(
        collection(db, 'elections'),
        where('status', 'in', [ELECTION_STATUS.DRAFT, ELECTION_STATUS.PREVIEW, ELECTION_STATUS.ACTIVE])
      );
      const snapshot = await getDocs(q);
      setElections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching elections:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.electionId || !formData.name || !formData.position || !formData.platform) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let photoUrl = '';

      // Upload photo if provided
      if (photoFile) {
        const photoRef = ref(storage, `candidates/${Date.now()}_${photoFile.name}`);
        await uploadBytes(photoRef, photoFile);
        photoUrl = await getDownloadURL(photoRef);
      }

      // Create candidate document
      await addDoc(collection(db, 'candidates'), {
        electionId: formData.electionId,
        name: formData.name,
        email: formData.email || '',
        studentId: formData.studentId || '',
        department: formData.department || '',
        gradeLevel: formData.gradeLevel || '',
        position: formData.position,
        platform: formData.platform,
        slogan: formData.slogan || '',
        photoUrl,
        status: 'approved', // Admin-added candidates are auto-approved
        voteCount: 0,
        addedByAdmin: true,
        createdAt: serverTimestamp()
      });

      toast.success('Candidate added successfully!');
      router.push('/admin/candidates');
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
    } finally {
      setLoading(false);
    }
  };

  const electionOptions = elections.map(e => ({ value: e.id, label: e.name }));
  const positionOptions = POSITIONS.map(p => ({ value: p, label: p }));

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Candidates
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Candidate</h1>
        <p className="text-gray-600 dark:text-gray-400">Add a candidate to an election</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Election & Position */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Election Details</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <Select
              label="Select Election *"
              name="electionId"
              value={formData.electionId}
              onChange={handleChange}
              options={electionOptions}
              placeholder="Choose an election"
              required
            />
            <Select
              label="Position *"
              name="position"
              value={formData.position}
              onChange={handleChange}
              options={positionOptions}
              placeholder="Select position"
              required
            />
          </Card.Body>
        </Card>

        {/* Candidate Info */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Candidate Information</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <Input
              label="Full Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter candidate's full name"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="candidate@school.edu"
              />
              <Input
                label="Student ID"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g., 2024-0001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
              />
              <Input
                label="Grade Level"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                placeholder="e.g., Grade 12"
              />
            </div>
            <Input
              label="Campaign Slogan"
              name="slogan"
              value={formData.slogan}
              onChange={handleChange}
              placeholder="Enter campaign slogan"
            />
          </Card.Body>
        </Card>

        {/* Photo Upload */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Candidate Photo</h2>
          </Card.Header>
          <Card.Body>
            <div className="flex items-center gap-6">
              <div 
                onClick={() => photoInputRef.current?.click()}
                className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden bg-gray-50 dark:bg-gray-800"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-500">Click to upload</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Photo</p>
                <p>Recommended: Square image, at least 200x200px</p>
                <p>Formats: JPG, PNG (max 5MB)</p>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </Card.Body>
        </Card>

        {/* Platform */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Campaign Platform *</h2>
          </Card.Header>
          <Card.Body>
            <textarea
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the candidate's platform, goals, and what they plan to achieve if elected..."
              required
            />
          </Card.Body>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            <User className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </form>
    </div>
  );
}

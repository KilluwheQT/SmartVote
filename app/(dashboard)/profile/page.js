'use client';

import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  GraduationCap,
  Shield,
  Camera,
  Save
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    gradeLevel: user?.gradeLevel || '',
    section: user?.section || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileRef = ref(storage, `profiles/${user.uid}/photo`);
      await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);

      await updateProfile(auth.currentUser, { photoURL });
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL,
        updatedAt: serverTimestamp()
      });

      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(auth.currentUser, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <Card.Body className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <Avatar 
              src={user?.photoURL} 
              name={user?.displayName || user?.email} 
              size="xl" 
            />
            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.displayName || 'User'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
              <Badge variant="primary">
                <Shield className="w-3 h-3 mr-1" />
                {userRole?.replace('_', ' ')}
              </Badge>
              {user?.hasVoted && (
                <Badge variant="success">Voted</Badge>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Personal Information</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <Input
                label="Email"
                value={user?.email || ''}
                disabled
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10"
                placeholder="+1 234 567 8900"
              />
            </div>
          </Card.Body>
        </Card>

        <Card className="mt-6">
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Academic Information</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <Input
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="2024-0001"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <GraduationCap className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                <Input
                  label="Grade Level"
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Freshman"
                />
              </div>
              <Input
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="A"
              />
            </div>

            <div className="relative">
              <Building className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <Input
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="pl-10"
                placeholder="Computer Science"
              />
            </div>
          </Card.Body>
          <Card.Footer className="flex justify-end">
            <Button type="submit" loading={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </Card.Footer>
        </Card>
      </form>
    </div>
  );
}

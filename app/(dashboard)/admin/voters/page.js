'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Upload, 
  Search, 
  UserX, 
  UserCheck, 
  Mail,
  Filter
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateVoterStatus } from '@/lib/services/voterService';
import { useAuth } from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { VOTER_STATUS } from '@/lib/constants';
import toast from 'react-hot-toast';

function VotersManagement() {
  const { user } = useAuth();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const votersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVoters(votersData);
    } catch (error) {
      console.error('Error fetching voters:', error);
      toast.error('Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockVoter = async (voterId) => {
    const result = await updateVoterStatus(voterId, VOTER_STATUS.BLOCKED, user.uid);
    if (result.success) {
      toast.success('Voter blocked');
      fetchVoters();
    } else {
      toast.error('Failed to block voter');
    }
  };

  const handleUnblockVoter = async (voterId) => {
    const result = await updateVoterStatus(voterId, VOTER_STATUS.NOT_VOTED, user.uid);
    if (result.success) {
      toast.success('Voter unblocked');
      fetchVoters();
    } else {
      toast.error('Failed to unblock voter');
    }
  };

  const filteredVoters = voters.filter(v => {
    const matchesSearch = 
      v.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || v.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = Object.values(VOTER_STATUS).map(status => ({
    value: status,
    label: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Voters</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage registered voters</p>
        </div>
        <Link href="/admin/voters/import">
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Import Voters
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, email, or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
          placeholder="All Statuses"
          className="w-full md:w-48"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{voters.length}</p>
            <p className="text-sm text-gray-500">Total Voters</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {voters.filter(v => v.status === VOTER_STATUS.VOTED).length}
            </p>
            <p className="text-sm text-gray-500">Voted</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {voters.filter(v => v.status === VOTER_STATUS.NOT_VOTED || !v.status).length}
            </p>
            <p className="text-sm text-gray-500">Not Voted</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {voters.filter(v => v.status === VOTER_STATUS.BLOCKED).length}
            </p>
            <p className="text-sm text-gray-500">Blocked</p>
          </Card.Body>
        </Card>
      </div>

      {/* Voters Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Voter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Grade Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVoters.map((voter) => (
                <tr key={voter.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {voter.firstName} {voter.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{voter.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                    {voter.studentId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                    {voter.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 capitalize">
                    {voter.gradeLevel || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      voter.status === VOTER_STATUS.VOTED ? 'success' :
                      voter.status === VOTER_STATUS.BLOCKED ? 'danger' :
                      'default'
                    }>
                      {voter.status?.replace('_', ' ') || 'Not Voted'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {voter.status === VOTER_STATUS.BLOCKED ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUnblockVoter(voter.id)}
                        >
                          <UserCheck className="w-4 h-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleBlockVoter(voter.id)}
                        >
                          <UserX className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredVoters.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No voters found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function AdminVotersPage() {
  return (
    <AdminGuard>
      <VotersManagement />
    </AdminGuard>
  );
}

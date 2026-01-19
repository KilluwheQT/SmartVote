'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Play, 
  Pause, 
  StopCircle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { getAllElections, startElection, pauseElection, resumeElection, endElection, deleteElection } from '@/lib/services/electionService';
import { useAuth } from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { ELECTION_STATUS } from '@/lib/constants';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function ElectionsManagement() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const data = await getAllElections();
      setElections(data);
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleStartElection = async (election) => {
    setActionLoading(true);
    const result = await startElection(election.id, user.uid);
    if (result.success) {
      toast.success('Election started successfully');
      fetchElections();
    } else {
      toast.error(result.error || 'Failed to start election');
    }
    setActionLoading(false);
  };

  const handlePauseElection = async (election) => {
    setActionLoading(true);
    const result = await pauseElection(election.id, user.uid, 'Paused by admin');
    if (result.success) {
      toast.success('Election paused');
      fetchElections();
    } else {
      toast.error(result.error || 'Failed to pause election');
    }
    setActionLoading(false);
  };

  const handleResumeElection = async (election) => {
    setActionLoading(true);
    const result = await resumeElection(election.id, user.uid);
    if (result.success) {
      toast.success('Election resumed');
      fetchElections();
    } else {
      toast.error(result.error || 'Failed to resume election');
    }
    setActionLoading(false);
  };

  const handleEndElection = async (election) => {
    setActionLoading(true);
    const result = await endElection(election.id, user.uid);
    if (result.success) {
      toast.success('Election ended');
      fetchElections();
    } else {
      toast.error(result.error || 'Failed to end election');
    }
    setActionLoading(false);
  };

  const handleDeleteElection = async () => {
    if (!selectedElection) return;
    setActionLoading(true);
    const result = await deleteElection(selectedElection.id);
    if (result.success) {
      toast.success('Election deleted');
      setShowDeleteModal(false);
      setSelectedElection(null);
      fetchElections();
    } else {
      toast.error(result.error || 'Failed to delete election');
    }
    setActionLoading(false);
  };

  const filteredElections = elections.filter(e =>
    e.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return 'TBD';
    const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
    return format(d, 'MMM d, yyyy');
  };

  const getStatusBadge = (status) => {
    const variants = {
      [ELECTION_STATUS.DRAFT]: 'default',
      [ELECTION_STATUS.PREVIEW]: 'info',
      [ELECTION_STATUS.ACTIVE]: 'success',
      [ELECTION_STATUS.PAUSED]: 'warning',
      [ELECTION_STATUS.COMPLETED]: 'primary',
      [ELECTION_STATUS.CANCELLED]: 'danger'
    };
    return <Badge variant={variants[status] || 'default'}>{status?.replace('_', ' ')}</Badge>;
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Elections</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage election campaigns</p>
        </div>
        <Link href="/admin/elections/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Election
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search elections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Elections Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Election
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Votes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredElections.map((election) => (
                <tr key={election.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{election.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {election.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(election.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(election.startDate)} - {formatDate(election.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {election.totalVotes || 0} / {election.totalVoters || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/elections/${election.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      {election.status === ELECTION_STATUS.DRAFT && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStartElection(election)}
                          disabled={actionLoading}
                        >
                          <Play className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      
                      {election.status === ELECTION_STATUS.ACTIVE && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePauseElection(election)}
                            disabled={actionLoading}
                          >
                            <Pause className="w-4 h-4 text-yellow-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEndElection(election)}
                            disabled={actionLoading}
                          >
                            <StopCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      
                      {election.status === ELECTION_STATUS.PAUSED && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResumeElection(election)}
                          disabled={actionLoading}
                        >
                          <Play className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      
                      {election.status === ELECTION_STATUS.DRAFT && (
                        <>
                          <Link href={`/admin/elections/${election.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedElection(election);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredElections.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No elections found
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Election"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete &quot;{selectedElection?.name}&quot;? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteElection} loading={actionLoading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminElectionsPage() {
  return (
    <AdminGuard>
      <ElectionsManagement />
    </AdminGuard>
  );
}

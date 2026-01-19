'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Square,
  Users,
  Calendar,
  Clock,
  BarChart3,
  UserPlus,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCandidatesByElection } from '@/lib/services/candidateService';
import { getVotersByElection } from '@/lib/services/voterService';
import { useAuth } from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { ELECTION_STATUS } from '@/lib/constants';
import { logAuditAction } from '@/lib/services/auditService';
import toast from 'react-hot-toast';

function ElectionDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchElectionData();
    }
  }, [params.id]);

  const fetchElectionData = async () => {
    try {
      const electionDoc = await getDoc(doc(db, 'elections', params.id));
      if (electionDoc.exists()) {
        const data = electionDoc.data();
        setElection({
          id: electionDoc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate()
        });

        const [candidatesData, votersData] = await Promise.all([
          getCandidatesByElection(params.id),
          getVotersByElection(params.id)
        ]);
        setCandidates(candidatesData);
        setVoters(votersData);
      }
    } catch (error) {
      console.error('Error fetching election:', error);
      toast.error('Failed to load election');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'elections', params.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      await logAuditAction(user.uid, `ELECTION_${newStatus.toUpperCase()}`, {
        electionId: params.id,
        electionName: election.name
      });

      setElection(prev => ({ ...prev, status: newStatus }));
      toast.success(`Election ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update election status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'elections', params.id));
      await logAuditAction(user.uid, 'ELECTION_DELETED', {
        electionId: params.id,
        electionName: election.name
      });
      toast.success('Election deleted');
      router.push('/admin/elections');
    } catch (error) {
      toast.error('Failed to delete election');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getStatusBadge = (status) => {
    const variants = {
      [ELECTION_STATUS.DRAFT]: 'default',
      [ELECTION_STATUS.PREVIEW]: 'warning',
      [ELECTION_STATUS.ACTIVE]: 'success',
      [ELECTION_STATUS.PAUSED]: 'warning',
      [ELECTION_STATUS.COMPLETED]: 'primary',
      [ELECTION_STATUS.CANCELLED]: 'danger'
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Election not found
        </h2>
        <Button onClick={() => router.push('/admin/elections')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Elections
        </Button>
      </div>
    );
  }

  const turnoutPercentage = election.totalVoters > 0 
    ? ((election.totalVotes || 0) / election.totalVoters * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/elections')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Elections
        </Button>
        
        <div className="flex items-center gap-2">
          <Link href={`/admin/elections/${params.id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Election Info */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {election.name}
            </h1>
            <Badge variant={getStatusBadge(election.status)}>
              {election.status?.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {election.type?.replace('_', ' ')}
          </p>
        </div>

        {/* Status Actions */}
        <div className="flex gap-2">
          {election.status === ELECTION_STATUS.DRAFT && (
            <Button onClick={() => handleStatusChange(ELECTION_STATUS.ACTIVE)} loading={actionLoading}>
              <Play className="w-4 h-4 mr-2" />
              Start Election
            </Button>
          )}
          {election.status === ELECTION_STATUS.ACTIVE && (
            <>
              <Button variant="warning" onClick={() => handleStatusChange(ELECTION_STATUS.PAUSED)} loading={actionLoading}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button variant="danger" onClick={() => handleStatusChange(ELECTION_STATUS.COMPLETED)} loading={actionLoading}>
                <Square className="w-4 h-4 mr-2" />
                End
              </Button>
            </>
          )}
          {election.status === ELECTION_STATUS.PAUSED && (
            <Button onClick={() => handleStatusChange(ELECTION_STATUS.ACTIVE)} loading={actionLoading}>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body className="text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{voters.length}</p>
            <p className="text-sm text-gray-500">Total Voters</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="text-center">
            <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{election.totalVotes || 0}</p>
            <p className="text-sm text-gray-500">Votes Cast</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="text-center">
            <UserPlus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{candidates.length}</p>
            <p className="text-sm text-gray-500">Candidates</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{turnoutPercentage}%</p>
            <p className="text-sm text-gray-500 mb-2">Turnout</p>
            <ProgressBar value={parseFloat(turnoutPercentage)} max={100} />
          </Card.Body>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Election Details */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Election Details</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            {election.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-gray-900 dark:text-white">{election.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Start Date
                </p>
                <p className="text-gray-900 dark:text-white">{formatDate(election.startDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> End Date
                </p>
                <p className="text-gray-900 dark:text-white">{formatDate(election.endDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Positions</p>
              <div className="flex flex-wrap gap-2">
                {election.positions?.map((position) => (
                  <Badge key={position} variant="secondary">{position}</Badge>
                ))}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Candidates */}
        <Card>
          <Card.Header className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Candidates ({candidates.length})</h2>
            <Link href="/admin/candidates/new">
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </Link>
          </Card.Header>
          <Card.Body>
            {candidates.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {candidate.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{candidate.name}</p>
                        <p className="text-sm text-gray-500">{candidate.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={candidate.status === 'approved' ? 'success' : 'warning'} size="sm">
                        {candidate.status}
                      </Badge>
                      <Link href={`/admin/candidates/${candidate.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No candidates yet</p>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/voters/import">
              <Button variant="secondary">
                <Users className="w-4 h-4 mr-2" />
                Import Voters
              </Button>
            </Link>
            <Link href="/admin/candidates/new">
              <Button variant="secondary">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </Link>
            <Link href={`/admin/reports?election=${params.id}`}>
              <Button variant="secondary">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link href={`/live?election=${params.id}`}>
              <Button variant="secondary">
                <Eye className="w-4 h-4 mr-2" />
                View Live Results
              </Button>
            </Link>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Election"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{election.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
              Delete Election
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminElectionDetailPage() {
  return (
    <AdminGuard>
      <ElectionDetail />
    </AdminGuard>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye,
  Filter,
  Plus,
  Trash2
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { approveCandidate, rejectCandidate } from '@/lib/services/candidateService';
import { useAuth } from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { CANDIDATE_STATUS } from '@/lib/constants';
import toast from 'react-hot-toast';

function CandidatesManagement() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const candidatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (candidate) => {
    setActionLoading(true);
    const result = await approveCandidate(candidate.id, user.uid);
    if (result.success) {
      toast.success('Candidate approved');
      fetchCandidates();
    } else {
      toast.error('Failed to approve candidate');
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedCandidate || !rejectReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    const result = await rejectCandidate(selectedCandidate.id, user.uid, rejectReason);
    if (result.success) {
      toast.success('Candidate rejected');
      setShowRejectModal(false);
      setSelectedCandidate(null);
      setRejectReason('');
      fetchCandidates();
    } else {
      toast.error('Failed to reject candidate');
    }
    setActionLoading(false);
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = Object.values(CANDIDATE_STATUS).map(status => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  }));

  const pendingCount = candidates.filter(c => c.status === CANDIDATE_STATUS.PENDING).length;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Candidates</h1>
          <p className="text-gray-600 dark:text-gray-400">Add and manage election candidates</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge variant="warning" size="lg">
              {pendingCount} Pending Approval
            </Badge>
          )}
          <Link href="/admin/candidates/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name or position..."
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

      {/* Candidates Grid */}
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id}>
              <Card.Body>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl font-bold text-blue-600">
                    {candidate.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-gray-500">{candidate.position}</p>
                    <Badge 
                      variant={
                        candidate.status === CANDIDATE_STATUS.APPROVED ? 'success' :
                        candidate.status === CANDIDATE_STATUS.REJECTED ? 'danger' :
                        candidate.status === CANDIDATE_STATUS.WITHDRAWN ? 'default' :
                        'warning'
                      }
                      size="sm"
                      className="mt-2"
                    >
                      {candidate.status}
                    </Badge>
                  </div>
                </div>

                {candidate.platform && (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {candidate.platform}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  {candidate.status === CANDIDATE_STATUS.PENDING && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleApprove(candidate)}
                        disabled={actionLoading}
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setShowRejectModal(true);
                        }}
                        disabled={actionLoading}
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Card.Body className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No candidates found</p>
          </Card.Body>
        </Card>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedCandidate(null);
          setRejectReason('');
        }}
        title="Reject Candidate"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Please provide a reason for rejecting {selectedCandidate?.name}&apos;s application.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter rejection reason..."
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={actionLoading}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminCandidatesPage() {
  return (
    <AdminGuard>
      <CandidatesManagement />
    </AdminGuard>
  );
}

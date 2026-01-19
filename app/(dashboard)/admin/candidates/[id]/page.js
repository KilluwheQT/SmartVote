'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, User } from 'lucide-react';
import { doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { CANDIDATE_STATUS } from '@/lib/constants';
import { logAuditAction } from '@/lib/services/auditService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function CandidateDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCandidateData();
    }
  }, [params.id]);

  const fetchCandidateData = async () => {
    try {
      const candidateDoc = await getDoc(doc(db, 'candidates', params.id));
      if (candidateDoc.exists()) {
        const data = candidateDoc.data();
        setCandidate({
          id: candidateDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate()
        });

        // Fetch election details
        if (data.electionId) {
          const electionDoc = await getDoc(doc(db, 'elections', data.electionId));
          if (electionDoc.exists()) {
            setElection({ id: electionDoc.id, ...electionDoc.data() });
          }
        }
      } else {
        toast.error('Candidate not found');
        router.push('/admin/candidates');
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
      toast.error('Failed to load candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'candidates', params.id), {
        status: CANDIDATE_STATUS.APPROVED,
        approvedBy: user.uid,
        approvedAt: serverTimestamp()
      });
      
      await logAuditAction(user.uid, 'CANDIDATE_APPROVED', {
        candidateId: params.id,
        candidateName: candidate.name
      });

      setCandidate(prev => ({ ...prev, status: CANDIDATE_STATUS.APPROVED }));
      toast.success('Candidate approved');
    } catch (error) {
      toast.error('Failed to approve candidate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      toast.error('Please provide a reason');
      return;
    }

    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'candidates', params.id), {
        status: CANDIDATE_STATUS.REJECTED,
        rejectedBy: user.uid,
        rejectedAt: serverTimestamp(),
        rejectionReason: rejectReason
      });
      
      await logAuditAction(user.uid, 'CANDIDATE_REJECTED', {
        candidateId: params.id,
        candidateName: candidate.name,
        reason: rejectReason
      });

      setCandidate(prev => ({ ...prev, status: CANDIDATE_STATUS.REJECTED }));
      setShowRejectModal(false);
      toast.success('Candidate rejected');
    } catch (error) {
      toast.error('Failed to reject candidate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'candidates', params.id));
      await logAuditAction(user.uid, 'CANDIDATE_DELETED', {
        candidateId: params.id,
        candidateName: candidate.name
      });
      toast.success('Candidate deleted');
      router.push('/admin/candidates');
    } catch (error) {
      toast.error('Failed to delete candidate');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      [CANDIDATE_STATUS.PENDING]: 'warning',
      [CANDIDATE_STATUS.APPROVED]: 'success',
      [CANDIDATE_STATUS.REJECTED]: 'danger',
      [CANDIDATE_STATUS.WITHDRAWN]: 'default'
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

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Candidate not found
        </h2>
        <Button onClick={() => router.push('/admin/candidates')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/candidates')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Candidate Profile */}
      <Card>
        <Card.Body>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              {candidate.photoUrl ? (
                <img 
                  src={candidate.photoUrl} 
                  alt={candidate.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <User className="w-16 h-16 text-blue-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {candidate.name}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {candidate.position}
                  </p>
                </div>
                <Badge variant={getStatusBadge(candidate.status)} size="lg">
                  {candidate.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {candidate.email && (
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-900 dark:text-white">{candidate.email}</p>
                  </div>
                )}
                {candidate.studentId && (
                  <div>
                    <p className="text-gray-500">Student ID</p>
                    <p className="text-gray-900 dark:text-white">{candidate.studentId}</p>
                  </div>
                )}
                {candidate.department && (
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="text-gray-900 dark:text-white">{candidate.department}</p>
                  </div>
                )}
                {candidate.gradeLevel && (
                  <div>
                    <p className="text-gray-500">Grade Level</p>
                    <p className="text-gray-900 dark:text-white">{candidate.gradeLevel}</p>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              {candidate.status === CANDIDATE_STATUS.PENDING && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={handleApprove} loading={actionLoading}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => setShowRejectModal(true)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Election Info */}
      {election && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Election</h2>
          </Card.Header>
          <Card.Body>
            <p className="font-medium text-gray-900 dark:text-white">{election.name}</p>
            <p className="text-sm text-gray-500">{election.type?.replace('_', ' ')}</p>
          </Card.Body>
        </Card>
      )}

      {/* Campaign Slogan */}
      {candidate.slogan && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Campaign Slogan</h2>
          </Card.Header>
          <Card.Body>
            <p className="text-lg italic text-gray-700 dark:text-gray-300">
              "{candidate.slogan}"
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Platform */}
      {candidate.platform && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Campaign Platform</h2>
          </Card.Header>
          <Card.Body>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {candidate.platform}
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Vote Count */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white">Statistics</h2>
        </Card.Header>
        <Card.Body>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">{candidate.voteCount || 0}</p>
            <p className="text-gray-500">Total Votes</p>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Candidate"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{candidate.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Candidate"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Please provide a reason for rejecting {candidate.name}.
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

export default function AdminCandidateDetailPage() {
  return (
    <AdminGuard>
      <CandidateDetail />
    </AdminGuard>
  );
}

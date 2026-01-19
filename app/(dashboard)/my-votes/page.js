'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Vote, 
  CheckCircle, 
  Clock,
  Search,
  FileText
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { verifyVoteReceipt } from '@/lib/services/voteService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MyVotesPage() {
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [receiptToVerify, setReceiptToVerify] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVotes();
    }
  }, [user]);

  const fetchVotes = async () => {
    try {
      let snapshot;
      
      try {
        // Try with orderBy (requires composite index)
        const q = query(
          collection(db, 'votes'),
          where('voterId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (indexError) {
        // Fallback: query without orderBy if index doesn't exist
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Firestore index not ready for votes, using fallback query.');
          const fallbackQuery = query(
            collection(db, 'votes'),
            where('voterId', '==', user.uid)
          );
          snapshot = await getDocs(fallbackQuery);
        } else {
          throw indexError;
        }
      }
      
      let votesData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const voteData = doc.data();
          // Get election details
          const electionDoc = await getDocs(query(
            collection(db, 'elections'),
            where('__name__', '==', voteData.electionId)
          ));
          const electionData = electionDoc.docs[0]?.data() || {};
          
          return {
            id: doc.id,
            ...voteData,
            electionName: electionData.name || 'Unknown Election',
            electionType: electionData.type,
            timestamp: voteData.timestamp?.toDate()
          };
        })
      );
      
      // Sort client-side if fallback was used
      votesData = votesData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      setVotes(votesData);
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast.error('Failed to load voting history');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReceipt = async () => {
    if (!receiptToVerify) {
      toast.error('Please enter a receipt code');
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    // Find the election for this receipt
    const vote = votes.find(v => v.receipt === receiptToVerify);
    if (vote) {
      const result = await verifyVoteReceipt(receiptToVerify, vote.electionId);
      setVerificationResult(result);
    } else {
      setVerificationResult({ valid: false, message: 'Receipt not found in your voting history' });
    }

    setVerifying(false);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(date, 'MMMM d, yyyy h:mm a');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Votes</h1>
          <p className="text-gray-600 dark:text-gray-400">View your voting history and verify receipts</p>
        </div>
        <Button onClick={() => setVerifyModalOpen(true)}>
          <Search className="w-4 h-4 mr-2" />
          Verify Receipt
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <Card.Body className="text-center">
            <Vote className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{votes.length}</p>
            <p className="text-sm text-gray-500">Total Votes Cast</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{votes.length}</p>
            <p className="text-sm text-gray-500">Verified Votes</p>
          </Card.Body>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <Card.Body className="text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {votes[0] ? format(votes[0].timestamp, 'MMM d') : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">Last Vote</p>
          </Card.Body>
        </Card>
      </div>

      {/* Voting History */}
      {votes.length > 0 ? (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Voting History</h2>
          </Card.Header>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {votes.map((vote) => (
              <div key={vote.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {vote.electionName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {vote.electionType?.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(vote.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="success">Verified</Badge>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receipt</p>
                      <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                        {vote.receipt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <Card.Body className="text-center py-16">
            <Vote className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Votes Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven&apos;t participated in any elections yet.
            </p>
            <Link href="/elections">
              <Button>View Active Elections</Button>
            </Link>
          </Card.Body>
        </Card>
      )}

      {/* Verify Receipt Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => {
          setVerifyModalOpen(false);
          setReceiptToVerify('');
          setVerificationResult(null);
        }}
        title="Verify Vote Receipt"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Enter your vote receipt code to verify that your vote was recorded correctly.
          </p>
          
          <Input
            placeholder="Enter receipt code (e.g., A1B2C3D4E5F6)"
            value={receiptToVerify}
            onChange={(e) => setReceiptToVerify(e.target.value.toUpperCase())}
            className="font-mono"
          />

          {verificationResult && (
            <div className={`p-4 rounded-lg ${
              verificationResult.valid 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {verificationResult.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <FileText className="w-5 h-5 text-red-600" />
                )}
                <span className={verificationResult.valid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                  {verificationResult.message}
                </span>
              </div>
              {verificationResult.timestamp && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Recorded: {formatDate(verificationResult.timestamp)}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setVerifyModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handleVerifyReceipt} loading={verifying}>
              Verify
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/hooks/useAuth';
import { getElection, subscribeToElection } from '@/lib/services/electionService';
import { getCandidatesByElection } from '@/lib/services/candidateService';
import { checkVoterEligibility } from '@/lib/services/voterService';
import { castVote, hasUserVoted, getUserVoteReceipt } from '@/lib/services/voteService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { VotingBallot } from '@/components/elections';
import { ELECTION_STATUS } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function ElectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState(null);
  const [showBallot, setShowBallot] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id || !user) return;

      try {
        const [electionResult, candidatesData, voted, receipt] = await Promise.all([
          getElection(params.id),
          getCandidatesByElection(params.id),
          hasUserVoted(user.uid, params.id),
          getUserVoteReceipt(user.uid, params.id)
        ]);

        if (electionResult.success) {
          setElection(electionResult.data);
        }
        setCandidates(candidatesData);
        setHasVoted(voted);
        setVoteReceipt(receipt);

        // Check eligibility
        const eligibilityResult = await checkVoterEligibility(user.uid, params.id);
        setEligibility(eligibilityResult);
      } catch (error) {
        console.error('Error fetching election:', error);
        toast.error('Failed to load election details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToElection(params.id, (data) => {
      setElection(data);
    });

    return () => unsubscribe?.();
  }, [params.id, user]);

  const handleVoteSubmit = async (selections) => {
    setVotingLoading(true);
    try {
      const result = await castVote(user.uid, params.id, selections);
      if (result.success) {
        setHasVoted(true);
        setVoteReceipt(result.receipt);
        setShowBallot(false);
        toast.success('Your vote has been recorded!');
        return result;
      } else {
        toast.error(result.error || 'Failed to submit vote');
        return result;
      }
    } catch (error) {
      toast.error('An error occurred while submitting your vote');
      return { success: false, error: error.message };
    } finally {
      setVotingLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
    return format(d, 'MMMM d, yyyy h:mm a');
  };

  const getPositions = () => {
    const positionSet = new Set(candidates.map(c => c.position));
    return Array.from(positionSet).map(name => ({ name }));
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
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Election Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The election you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button onClick={() => router.push('/elections')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Elections
        </Button>
      </div>
    );
  }

  const turnoutPercentage = election.totalVoters > 0 
    ? (election.totalVotes / election.totalVoters) * 100 
    : 0;

  const isActive = election.status === ELECTION_STATUS.ACTIVE;
  const canVote = isActive && eligibility?.eligible && !hasVoted;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push('/elections')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Elections
      </Button>

      {/* Election Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {election.name}
            </h1>
            <Badge variant={
              election.status === ELECTION_STATUS.ACTIVE ? 'success' :
              election.status === ELECTION_STATUS.PAUSED ? 'warning' :
              election.status === ELECTION_STATUS.COMPLETED ? 'primary' : 'default'
            }>
              {election.status === ELECTION_STATUS.PAUSED && <Pause className="w-3 h-3 mr-1" />}
              {election.status === ELECTION_STATUS.ACTIVE && <Play className="w-3 h-3 mr-1" />}
              {election.status?.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {election.type?.replace('_', ' ')}
          </p>
        </div>

        {canVote && !showBallot && (
          <Button size="lg" onClick={() => setShowBallot(true)}>
            Cast Your Vote
          </Button>
        )}
      </div>

      {/* Voting Status Messages */}
      {hasVoted && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <Card.Body className="flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                You have already voted in this election
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your vote receipt: <span className="font-mono font-bold">{voteReceipt}</span>
              </p>
            </div>
          </Card.Body>
        </Card>
      )}

      {!eligibility?.eligible && !hasVoted && isActive && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <Card.Body className="flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                You are not eligible to vote
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                {eligibility?.reason || 'Contact an administrator for more information.'}
              </p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Voting Ballot */}
      {showBallot && canVote && (
        <VotingBallot
          positions={getPositions()}
          candidates={candidates}
          onSubmit={handleVoteSubmit}
          loading={votingLoading}
        />
      )}

      {/* Election Details */}
      {!showBallot && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {election.description && (
              <Card>
                <Card.Header>
                  <h2 className="font-semibold text-gray-900 dark:text-white">About this Election</h2>
                </Card.Header>
                <Card.Body>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {election.description}
                  </p>
                </Card.Body>
              </Card>
            )}

            {/* Candidates Preview */}
            <Card>
              <Card.Header>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Candidates ({candidates.length})
                </h2>
              </Card.Header>
              <Card.Body>
                {getPositions().map((position) => {
                  const positionCandidates = candidates.filter(c => c.position === position.name);
                  return (
                    <div key={position.name} className="mb-6 last:mb-0">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                        {position.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {positionCandidates.map((candidate) => (
                          <div 
                            key={candidate.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                              {candidate.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {candidate.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {candidate.department}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Election Info */}
            <Card>
              <Card.Header>
                <h2 className="font-semibold text-gray-900 dark:text-white">Election Details</h2>
              </Card.Header>
              <Card.Body className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(election.startDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(election.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Eligible Voters</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {election.totalVoters || 0}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Voter Turnout */}
            <Card>
              <Card.Header>
                <h2 className="font-semibold text-gray-900 dark:text-white">Voter Turnout</h2>
              </Card.Header>
              <Card.Body>
                <ProgressBar 
                  value={turnoutPercentage} 
                  max={100}
                  color="green"
                  showLabel={true}
                />
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {election.totalVotes || 0} of {election.totalVoters || 0} voters
                </p>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

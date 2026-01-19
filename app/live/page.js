'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Vote, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowLeft,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ELECTION_STATUS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { format } from 'date-fns';

export default function LiveResultsPage() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [electionData, setElectionData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      const unsubscribe = subscribeToElection(selectedElection);
      return () => unsubscribe && unsubscribe();
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const q = query(
        collection(db, 'elections'),
        where('status', 'in', [ELECTION_STATUS.ACTIVE, ELECTION_STATUS.COMPLETED])
      );
      const snapshot = await getDocs(q);
      const electionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setElections(electionsData);
      
      if (electionsData.length > 0) {
        setSelectedElection(electionsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToElection = (electionId) => {
    // Subscribe to election data
    const electionUnsubscribe = onSnapshot(
      query(collection(db, 'elections'), where('__name__', '==', electionId)),
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setElectionData({
            id: snapshot.docs[0].id,
            ...data,
            startDate: data.startDate?.toDate(),
            endDate: data.endDate?.toDate()
          });
        }
      }
    );

    // Subscribe to candidates
    const candidatesUnsubscribe = onSnapshot(
      query(
        collection(db, 'candidates'),
        where('electionId', '==', electionId),
        where('status', '==', 'approved')
      ),
      (snapshot) => {
        const candidatesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCandidates(candidatesData);
        setLastUpdated(new Date());
      }
    );

    return () => {
      electionUnsubscribe();
      candidatesUnsubscribe();
    };
  };

  const getPositions = () => {
    const positions = [...new Set(candidates.map(c => c.position))];
    return positions;
  };

  const getCandidatesByPosition = (position) => {
    return candidates
      .filter(c => c.position === position)
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
  };

  const getTotalVotesForPosition = (position) => {
    return getCandidatesByPosition(position).reduce((sum, c) => sum + (c.voteCount || 0), 0);
  };

  const electionOptions = elections.map(e => ({
    value: e.id,
    label: `${e.name} ${e.status === ELECTION_STATUS.COMPLETED ? '(Completed)' : '(Live)'}`
  }));

  const participationRate = electionData 
    ? ((electionData.totalVotes || 0) / (electionData.totalVoters || 1) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Live Election Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time voting results - No login required
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4" />
            Last updated: {format(lastUpdated, 'h:mm:ss a')}
          </div>
        </div>

        {/* Election Selector */}
        <Card className="mb-6">
          <Card.Body>
            <Select
              label="Select Election"
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              options={electionOptions}
              placeholder="Choose an election to view"
            />
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading elections...</p>
          </div>
        ) : !selectedElection ? (
          <Card>
            <Card.Body className="text-center py-12">
              <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No active or completed elections available
              </p>
            </Card.Body>
          </Card>
        ) : electionData ? (
          <>
            {/* Election Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <Card.Body className="text-center">
                  <Badge variant={electionData.status === ELECTION_STATUS.ACTIVE ? 'success' : 'secondary'}>
                    {electionData.status === ELECTION_STATUS.ACTIVE ? 'LIVE' : 'COMPLETED'}
                  </Badge>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {electionData.name}
                  </p>
                </Card.Body>
              </Card>

              <Card>
                <Card.Body className="text-center">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {electionData.totalVotes || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Votes Cast</p>
                </Card.Body>
              </Card>

              <Card>
                <Card.Body className="text-center">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {participationRate}%
                  </p>
                  <p className="text-sm text-gray-500">Participation Rate</p>
                </Card.Body>
              </Card>

              <Card>
                <Card.Body className="text-center">
                  <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {electionData.endDate ? format(electionData.endDate, 'MMM d, yyyy') : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {electionData.status === ELECTION_STATUS.ACTIVE ? 'Ends on' : 'Ended on'}
                  </p>
                </Card.Body>
              </Card>
            </div>

            {/* Results by Position */}
            <div className="space-y-6">
              {getPositions().map(position => {
                const positionCandidates = getCandidatesByPosition(position);
                const totalVotes = getTotalVotesForPosition(position);
                const leader = positionCandidates[0];

                return (
                  <Card key={position}>
                    <Card.Header>
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {position}
                        </h2>
                        <span className="text-sm text-gray-500">
                          {totalVotes} votes
                        </span>
                      </div>
                    </Card.Header>
                    <Card.Body className="space-y-4">
                      {positionCandidates.map((candidate, index) => {
                        const percentage = totalVotes > 0 
                          ? ((candidate.voteCount || 0) / totalVotes * 100).toFixed(1)
                          : 0;
                        const isLeader = index === 0 && (candidate.voteCount || 0) > 0;

                        return (
                          <div key={candidate.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                              {candidate.photoUrl ? (
                                <img 
                                  src={candidate.photoUrl} 
                                  alt={candidate.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                  {candidate.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                  {candidate.name}
                                </span>
                                {isLeader && (
                                  <Badge variant="success" size="sm">Leading</Badge>
                                )}
                              </div>
                              <ProgressBar 
                                value={parseFloat(percentage)} 
                                max={100}
                                color={isLeader ? 'green' : 'blue'}
                              />
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {candidate.voteCount || 0}
                              </p>
                              <p className="text-sm text-gray-500">{percentage}%</p>
                            </div>
                          </div>
                        );
                      })}

                      {positionCandidates.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          No candidates for this position
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}

              {getPositions().length === 0 && (
                <Card>
                  <Card.Body className="text-center py-8">
                    <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No candidates have been added to this election yet
                    </p>
                  </Card.Body>
                </Card>
              )}
            </div>
          </>
        ) : null}

        <p className="text-center text-sm text-gray-500 mt-8">
          Results update automatically in real-time
        </p>
      </div>
    </div>
  );
}

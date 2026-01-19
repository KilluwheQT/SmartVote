'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Vote, 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Bell,
  Award,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getActiveElections, getAllElections } from '@/lib/services/electionService';
import { hasUserVoted } from '@/lib/services/voteService';
import { getUserNotifications } from '@/lib/services/notificationService';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ElectionCard } from '@/components/elections';
import { ELECTION_STATUS } from '@/lib/constants';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeElections, setActiveElections] = useState([]);
  const [recentElections, setRecentElections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [votedElections, setVotedElections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [active, all, notifs] = await Promise.all([
          getActiveElections(),
          getAllElections(),
          getUserNotifications(user.uid)
        ]);

        setActiveElections(active);
        setRecentElections(all.slice(0, 5));
        setNotifications(notifs.slice(0, 5));

        // Check which elections user has voted in
        const votedStatus = {};
        for (const election of active) {
          votedStatus[election.id] = await hasUserVoted(user.uid, election.id);
        }
        setVotedElections(votedStatus);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = [
    {
      label: 'Active Elections',
      value: activeElections.length,
      icon: Vote,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Pending Votes',
      value: activeElections.filter(e => !votedElections[e.id]).length,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      label: 'Votes Cast',
      value: Object.values(votedElections).filter(Boolean).length,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Notifications',
      value: notifications.filter(n => !n.read).length,
      icon: Bell,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Voter'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your elections
          </p>
        </div>
        {user?.hasVoted && (
          <Badge variant="success" size="lg">
            <Award className="w-4 h-4 mr-1" />
            Did You Vote? ✓
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <Card.Body className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {/* Active Elections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Elections
          </h2>
          <Link href="/elections" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {activeElections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeElections.map((election) => (
              <div key={election.id} className="relative">
                <ElectionCard election={election} />
                {votedElections[election.id] && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Voted
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <Card.Body className="text-center py-12">
              <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Active Elections
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                There are no elections currently open for voting. Check back later!
              </p>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Recent Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Elections */}
        <Card>
          <Card.Header>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Elections
            </h3>
          </Card.Header>
          <Card.Body className="p-0">
            {recentElections.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentElections.map((election) => (
                  <Link
                    key={election.id}
                    href={`/elections/${election.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {election.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {election.type?.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge variant={
                      election.status === ELECTION_STATUS.ACTIVE ? 'success' :
                      election.status === ELECTION_STATUS.COMPLETED ? 'primary' : 'default'
                    }>
                      {election.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No recent elections
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Notifications */}
        <Card>
          <Card.Header>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
            </h3>
          </Card.Header>
          <Card.Body className="p-0">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            )}
          </Card.Body>
          <Card.Footer>
            <Link href="/notifications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all notifications
            </Link>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
}

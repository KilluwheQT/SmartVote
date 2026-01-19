'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Vote, 
  Users, 
  UserCheck, 
  BarChart3, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAllElections } from '@/lib/services/electionService';
import { getAuditLogs } from '@/lib/services/auditService';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { ELECTION_STATUS } from '@/lib/constants';
import { ParticipationChart } from '@/components/charts';

function AdminDashboard() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionsData, logsData] = await Promise.all([
          getAllElections(),
          getAuditLogs({ limit: 10 })
        ]);
        setElections(electionsData);
        setRecentLogs(logsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeElections = elections.filter(e => e.status === ELECTION_STATUS.ACTIVE);
  const completedElections = elections.filter(e => e.status === ELECTION_STATUS.COMPLETED);
  const totalVotes = elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0);
  const totalVoters = elections.reduce((sum, e) => sum + (e.totalVoters || 0), 0);

  const stats = [
    {
      label: 'Total Elections',
      value: elections.length,
      icon: Vote,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      href: '/admin/elections'
    },
    {
      label: 'Active Elections',
      value: activeElections.length,
      icon: Clock,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      href: '/admin/elections?status=active'
    },
    {
      label: 'Total Votes Cast',
      value: totalVotes,
      icon: CheckCircle,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      href: '/admin/reports'
    },
    {
      label: 'Registered Voters',
      value: totalVoters,
      icon: Users,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      href: '/admin/voters'
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage elections, voters, and candidates</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.href}>
              <Card hover>
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
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/admin/elections/new"
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Vote className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">New Election</span>
            </Link>
            <Link 
              href="/admin/voters/import"
              className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Import Voters</span>
            </Link>
            <Link 
              href="/admin/candidates"
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <UserCheck className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Candidates</span>
            </Link>
            <Link 
              href="/admin/reports"
              className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Reports</span>
            </Link>
          </div>
        </Card.Body>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Elections */}
        <Card>
          <Card.Header className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Active Elections</h2>
            <Link href="/admin/elections" className="text-blue-600 hover:text-blue-700 text-sm">
              View all
            </Link>
          </Card.Header>
          <Card.Body className="p-0">
            {activeElections.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activeElections.slice(0, 5).map((election) => (
                  <Link
                    key={election.id}
                    href={`/admin/elections/${election.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{election.name}</p>
                      <p className="text-sm text-gray-500">{election.totalVotes || 0} votes</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No active elections
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Overall Participation */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Overall Participation</h2>
          </Card.Header>
          <Card.Body>
            <ParticipationChart 
              voted={totalVotes} 
              total={totalVoters} 
              title="Total Turnout"
            />
          </Card.Body>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <Card.Header className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <Link href="/admin/audit" className="text-blue-600 hover:text-blue-700 text-sm">
              View all logs
            </Link>
          </Card.Header>
          <Card.Body className="p-0">
            {recentLogs.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          log.action.includes('vote') ? 'bg-green-100 dark:bg-green-900/30' :
                          log.action.includes('election') ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {log.action.includes('vote') ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                           log.action.includes('election') ? <Vote className="w-4 h-4 text-blue-600" /> :
                           <AlertCircle className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {log.timestamp?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent activity
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText,
  TrendingUp,
  Users,
  Vote
} from 'lucide-react';
import { getAllElections } from '@/lib/services/electionService';
import { generateElectionReport, getParticipationByGradeLevel, getParticipationByDepartment, prepareExcelData } from '@/lib/services/reportService';
import * as XLSX from 'xlsx';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { AdminGuard } from '@/components/auth/AuthGuard';
import { VoteDistributionChart, ParticipationChart } from '@/components/charts';
import { ELECTION_STATUS } from '@/lib/constants';
import toast from 'react-hot-toast';

function ReportsPage() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [report, setReport] = useState(null);
  const [participationByGrade, setParticipationByGrade] = useState({});
  const [participationByDept, setParticipationByDept] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const data = await getAllElections();
      setElections(data.filter(e => e.status === ELECTION_STATUS.COMPLETED || e.status === ELECTION_STATUS.ACTIVE));
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedElection) {
      toast.error('Please select an election');
      return;
    }

    setGenerating(true);
    try {
      const [reportData, gradeData, deptData] = await Promise.all([
        generateElectionReport(selectedElection),
        getParticipationByGradeLevel(selectedElection),
        getParticipationByDepartment(selectedElection)
      ]);

      if (reportData.success) {
        setReport(reportData.data);
        setParticipationByGrade(gradeData);
        setParticipationByDept(deptData);
        toast.success('Report generated successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportExcel = () => {
    if (!report) return;

    const sheets = prepareExcelData(report);
    const wb = XLSX.utils.book_new();
    
    Object.entries(sheets).forEach(([name, data]) => {
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, name);
    });

    const electionName = elections.find(e => e.id === selectedElection)?.name || 'election';
    XLSX.writeFile(wb, `${electionName}_report.xlsx`);
    toast.success('Report exported');
  };

  const handleExportPDF = () => {
    toast.info('PDF export would be implemented with a library like jsPDF');
  };

  const electionOptions = elections.map(e => ({
    value: e.id,
    label: e.name
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Generate detailed election reports and analytics</p>
      </div>

      {/* Election Selection */}
      <Card>
        <Card.Body className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Select
              label="Select Election"
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              options={electionOptions}
              placeholder="Choose an election to analyze"
            />
          </div>
          <Button onClick={handleGenerateReport} loading={generating}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </Card.Body>
      </Card>

      {report && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <Card.Body className="text-center">
                <Vote className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.totalVotes}</p>
                <p className="text-sm text-gray-500">Total Votes</p>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body className="text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.totalVoters}</p>
                <p className="text-sm text-gray-500">Total Voters</p>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body className="text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.turnoutPercentage}%</p>
                <p className="text-sm text-gray-500">Turnout Rate</p>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body className="text-center">
                <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(report.results || {}).length}
                </p>
                <p className="text-sm text-gray-500">Positions</p>
              </Card.Body>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voter Turnout */}
            <Card>
              <Card.Header>
                <h2 className="font-semibold text-gray-900 dark:text-white">Voter Turnout</h2>
              </Card.Header>
              <Card.Body>
                <ParticipationChart 
                  voted={report.totalVotes} 
                  total={report.totalVoters}
                  title="Overall Turnout"
                />
              </Card.Body>
            </Card>

            {/* Participation by Grade Level */}
            <Card>
              <Card.Header>
                <h2 className="font-semibold text-gray-900 dark:text-white">Participation by Grade Level</h2>
              </Card.Header>
              <Card.Body>
                <VoteDistributionChart 
                  data={{
                    labels: Object.keys(participationByGrade),
                    values: Object.values(participationByGrade).map(p => p.voted)
                  }}
                  title="Votes by Grade"
                />
              </Card.Body>
            </Card>
          </div>

          {/* Winners */}
          <Card>
            <Card.Header className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Election Winners</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(report.winners || {}).map(([position, winner]) => {
                    const totalPositionVotes = Object.values(report.results?.[position] || {})
                      .reduce((sum, c) => sum + c.votes, 0);
                    const percentage = totalPositionVotes > 0 
                      ? ((winner?.votes / totalPositionVotes) * 100).toFixed(1) 
                      : 0;
                    
                    return (
                      <tr key={position}>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{position}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{winner?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{winner?.votes || 0}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card.Body>
          </Card>

          {/* Detailed Results */}
          <Card>
            <Card.Header>
              <h2 className="font-semibold text-gray-900 dark:text-white">Detailed Vote Distribution</h2>
            </Card.Header>
            <Card.Body className="space-y-6">
              {Object.entries(report.results || {}).map(([position, candidates]) => (
                <div key={position}>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">{position}</h3>
                  <VoteDistributionChart 
                    data={{
                      labels: Object.values(candidates).map(c => c.name),
                      values: Object.values(candidates).map(c => c.votes)
                    }}
                    title=""
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </>
      )}

      {!report && !generating && (
        <Card>
          <Card.Body className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Report Generated
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Select an election and click &quot;Generate Report&quot; to view analytics
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <AdminGuard>
      <ReportsPage />
    </AdminGuard>
  );
}

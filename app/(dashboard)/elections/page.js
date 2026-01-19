'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Vote } from 'lucide-react';
import { getAllElections } from '@/lib/services/electionService';
import { ElectionCard } from '@/components/elections';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ELECTION_STATUS, ELECTION_TYPES } from '@/lib/constants';

export default function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await getAllElections();
        setElections(data);
        setFilteredElections(data);
      } catch (error) {
        console.error('Error fetching elections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  useEffect(() => {
    let filtered = elections;

    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(e => e.type === typeFilter);
    }

    setFilteredElections(filtered);
  }, [searchQuery, statusFilter, typeFilter, elections]);

  const statusOptions = Object.values(ELECTION_STATUS).map(status => ({
    value: status,
    label: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)
  }));

  const typeOptions = Object.entries(ELECTION_TYPES).map(([key, value]) => ({
    value: value,
    label: key.replace('_', ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Elections</h1>
        <p className="text-gray-600 dark:text-gray-400">Browse and participate in available elections</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search elections..."
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
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={typeOptions}
          placeholder="All Types"
          className="w-full md:w-48"
        />
      </div>

      {/* Elections Grid */}
      {filteredElections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election) => (
            <ElectionCard key={election.id} election={election} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Vote className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Elections Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter || typeFilter 
              ? 'Try adjusting your filters'
              : 'No elections are currently available'}
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Calendar, Users, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { ELECTION_STATUS } from '@/lib/constants';

const statusColors = {
  [ELECTION_STATUS.DRAFT]: 'default',
  [ELECTION_STATUS.PREVIEW]: 'info',
  [ELECTION_STATUS.ACTIVE]: 'success',
  [ELECTION_STATUS.PAUSED]: 'warning',
  [ELECTION_STATUS.COMPLETED]: 'primary',
  [ELECTION_STATUS.CANCELLED]: 'danger'
};

const ElectionCard = ({ election, showActions = true }) => {
  const {
    id,
    name,
    description,
    type,
    status,
    startDate,
    endDate,
    totalVoters = 0,
    totalVotes = 0
  } = election;

  const turnoutPercentage = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;

  const formatDate = (date) => {
    if (!date) return 'TBD';
    const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
    return format(d, 'MMM d, yyyy h:mm a');
  };

  return (
    <Card hover className="overflow-hidden">
      <Card.Body>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {type?.replace('_', ' ')}
            </p>
          </div>
          <Badge variant={statusColors[status] || 'default'}>
            {status?.replace('_', ' ')}
          </Badge>
        </div>

        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Start: {formatDate(startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>End: {formatDate(endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{totalVotes} / {totalVoters} voters</span>
          </div>
        </div>

        {status === ELECTION_STATUS.ACTIVE && (
          <div className="mt-4">
            <ProgressBar 
              value={turnoutPercentage} 
              max={100} 
              color="green"
              showLabel={true}
            />
          </div>
        )}
      </Card.Body>

      {showActions && (
        <Card.Footer className="bg-gray-50 dark:bg-gray-800/50">
          <Link
            href={`/elections/${id}`}
            className="flex items-center justify-between w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium text-sm"
          >
            <span>
              {status === ELECTION_STATUS.ACTIVE ? 'Vote Now' : 'View Details'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ElectionCard;

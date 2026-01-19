'use client';

import Image from 'next/image';
import { Play, FileText, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const CandidateCard = ({ 
  candidate, 
  selected = false, 
  onSelect, 
  showVoteButton = true,
  showDetails = true 
}) => {
  const {
    id,
    name,
    photoUrl,
    position,
    platform,
    videoUrl,
    department,
    gradeLevel
  } = candidate;

  return (
    <Card 
      className={`
        transition-all
        ${selected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
      `}
    >
      <Card.Body>
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                {name?.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {department} • {gradeLevel}
                </p>
              </div>
              {selected && (
                <CheckCircle className="w-6 h-6 text-blue-600" />
              )}
            </div>

            <Badge variant="primary" size="sm" className="mt-2">
              {position}
            </Badge>
          </div>
        </div>

        {showDetails && platform && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Platform
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {platform}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          {videoUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(videoUrl, '_blank')}
            >
              <Play className="w-4 h-4 mr-1" />
              Watch Video
            </Button>
          )}
          {showDetails && (
            <Button
              variant="ghost"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-1" />
              Full Profile
            </Button>
          )}
        </div>

        {showVoteButton && onSelect && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant={selected ? 'secondary' : 'primary'}
              className="w-full"
              onClick={() => onSelect(id)}
            >
              {selected ? 'Selected' : 'Select Candidate'}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CandidateCard;

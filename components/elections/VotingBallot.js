'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import CandidateCard from './CandidateCard';
import Modal from '../ui/Modal';

const VotingBallot = ({ 
  positions = [], 
  candidates = [], 
  onSubmit, 
  loading = false 
}) => {
  const [selections, setSelections] = useState({});
  const [currentPosition, setCurrentPosition] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const currentPositionData = positions[currentPosition];
  const positionCandidates = candidates.filter(
    c => c.position === currentPositionData?.name
  );

  const handleSelect = (candidateId) => {
    setSelections({
      ...selections,
      [currentPositionData.name]: candidateId
    });
  };

  const handleNext = () => {
    if (currentPosition < positions.length - 1) {
      setCurrentPosition(currentPosition + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPosition > 0) {
      setCurrentPosition(currentPosition - 1);
    }
  };

  const handleSubmit = async () => {
    setShowConfirmModal(false);
    const result = await onSubmit(selections);
    if (result?.success) {
      setReceipt(result.receipt);
      setShowReceiptModal(true);
    }
  };

  const allPositionsSelected = positions.every(
    p => selections[p.name]
  );

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        {positions.map((position, index) => (
          <div key={position.name} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${index === currentPosition 
                ? 'bg-blue-600 text-white' 
                : selections[position.name]
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}>
              {selections[position.name] ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < positions.length - 1 && (
              <div className={`
                w-12 h-1 mx-2
                ${selections[position.name] ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Current position */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Vote for {currentPositionData?.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select one candidate for this position
          </p>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positionCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                selected={selections[currentPositionData?.name] === candidate.id}
                onSelect={handleSelect}
                showDetails={false}
              />
            ))}
          </div>

          {positionCandidates.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No candidates available for this position
            </div>
          )}
        </Card.Body>
        <Card.Footer className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentPosition === 0}
          >
            Previous
          </Button>
          
          {currentPosition === positions.length - 1 ? (
            <Button
              variant="success"
              onClick={() => setShowConfirmModal(true)}
              disabled={!allPositionsSelected}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Ballot
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!selections[currentPositionData?.name]}
            >
              Next Position
            </Button>
          )}
        </Card.Footer>
      </Card>

      {/* Selections summary */}
      <Card>
        <Card.Header>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Your Selections
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-2">
            {positions.map((position) => {
              const selectedCandidate = candidates.find(
                c => c.id === selections[position.name]
              );
              return (
                <div 
                  key={position.name}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {position.name}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedCandidate?.name || 'Not selected'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Your Vote"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please review your selections carefully. Once submitted, your vote cannot be changed.
            </p>
          </div>

          <div className="space-y-2">
            {positions.map((position) => {
              const selectedCandidate = candidates.find(
                c => c.id === selections[position.name]
              );
              return (
                <div 
                  key={position.name}
                  className="flex items-center justify-between py-2"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {position.name}:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedCandidate?.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
            >
              Review Again
            </Button>
            <Button
              variant="success"
              className="flex-1"
              onClick={handleSubmit}
              loading={loading}
            >
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Vote Submitted Successfully!"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Your vote has been recorded successfully.
          </p>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Your Vote Receipt
            </p>
            <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
              {receipt}
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Save this receipt to verify your vote later. It does not reveal your choices.
          </p>

          <Button
            className="w-full"
            onClick={() => setShowReceiptModal(false)}
          >
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VotingBallot;

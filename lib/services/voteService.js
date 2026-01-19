import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { VOTER_STATUS, AUDIT_ACTIONS } from '../constants';
import { encryptVote, generateVoteReceipt, hashData } from '../encryption';
import { logAuditAction } from './auditService';

export const castVote = async (voterId, electionId, selections) => {
  try {
    // Check if already voted
    const existingVoteQuery = query(
      collection(db, 'votes'),
      where('voterId', '==', voterId),
      where('electionId', '==', electionId)
    );
    const existingVotes = await getDocs(existingVoteQuery);
    
    if (!existingVotes.empty) {
      return { success: false, error: 'You have already voted in this election' };
    }

    // Encrypt the vote
    const encryptedSelections = encryptVote(selections);
    const voteHash = hashData({ voterId, electionId, selections, timestamp: Date.now() });
    const receipt = generateVoteReceipt(voterId, electionId, Date.now());

    // Store the vote
    const voteRef = await addDoc(collection(db, 'votes'), {
      voterId,
      electionId,
      encryptedSelections,
      voteHash,
      receipt,
      timestamp: serverTimestamp(),
      verified: false
    });

    // Update voter status
    const voterQuery = query(
      collection(db, 'voters'),
      where('userId', '==', voterId),
      where('electionId', '==', electionId)
    );
    const voterSnapshot = await getDocs(voterQuery);
    
    if (!voterSnapshot.empty) {
      await updateDoc(voterSnapshot.docs[0].ref, {
        status: VOTER_STATUS.VOTED,
        votedAt: serverTimestamp()
      });
    }

    // Update user's hasVoted status
    await updateDoc(doc(db, 'users', voterId), {
      hasVoted: true,
      lastVotedAt: serverTimestamp()
    });

    // Update election vote count
    await updateDoc(doc(db, 'elections', electionId), {
      totalVotes: increment(1)
    });

    // Log audit action
    await logAuditAction(voterId, AUDIT_ACTIONS.VOTE_CAST, {
      electionId,
      receipt
    });

    return { 
      success: true, 
      receipt,
      voteId: voteRef.id
    };
  } catch (error) {
    console.error('Cast vote error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyVoteReceipt = async (receipt, electionId) => {
  try {
    const q = query(
      collection(db, 'votes'),
      where('receipt', '==', receipt),
      where('electionId', '==', electionId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { valid: false, message: 'Vote receipt not found' };
    }

    const voteData = snapshot.docs[0].data();
    return { 
      valid: true, 
      message: 'Vote verified successfully',
      timestamp: voteData.timestamp?.toDate()
    };
  } catch (error) {
    console.error('Verify receipt error:', error);
    return { valid: false, message: error.message };
  }
};

export const getVotesByElection = async (electionId) => {
  try {
    const q = query(
      collection(db, 'votes'),
      where('electionId', '==', electionId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    console.error('Get votes error:', error);
    return [];
  }
};

export const hasUserVoted = async (userId, electionId) => {
  try {
    const q = query(
      collection(db, 'votes'),
      where('voterId', '==', userId),
      where('electionId', '==', electionId)
    );
    const snapshot = await getDocs(q);
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Check voted error:', error);
    return false;
  }
};

export const getUserVoteReceipt = async (userId, electionId) => {
  try {
    const q = query(
      collection(db, 'votes'),
      where('voterId', '==', userId),
      where('electionId', '==', electionId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data().receipt;
  } catch (error) {
    console.error('Get receipt error:', error);
    return null;
  }
};

export const getVoteStatistics = async (electionId) => {
  try {
    const votes = await getVotesByElection(electionId);
    
    const hourlyDistribution = {};
    votes.forEach(vote => {
      if (vote.timestamp) {
        const hour = vote.timestamp.getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      }
    });

    return {
      totalVotes: votes.length,
      hourlyDistribution
    };
  } catch (error) {
    console.error('Get vote statistics error:', error);
    return { totalVotes: 0, hourlyDistribution: {} };
  }
};

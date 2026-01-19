import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { ELECTION_STATUS, AUDIT_ACTIONS } from '../constants';
import { logAuditAction } from './auditService';

export const createElection = async (electionData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'elections'), {
      ...electionData,
      status: ELECTION_STATUS.DRAFT,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      totalVotes: 0,
      voterTurnout: 0
    });

    await logAuditAction(userId, AUDIT_ACTIONS.ELECTION_CREATED, {
      electionId: docRef.id,
      electionName: electionData.name
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Create election error:', error);
    return { success: false, error: error.message };
  }
};

export const getElection = async (electionId) => {
  try {
    const docRef = doc(db, 'elections', electionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        data: { id: docSnap.id, ...docSnap.data() } 
      };
    }
    return { success: false, error: 'Election not found' };
  } catch (error) {
    console.error('Get election error:', error);
    return { success: false, error: error.message };
  }
};

export const getAllElections = async () => {
  try {
    const q = query(collection(db, 'elections'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Get all elections error:', error);
    return [];
  }
};

export const getActiveElections = async () => {
  try {
    const q = query(
      collection(db, 'elections'),
      where('status', '==', ELECTION_STATUS.ACTIVE)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get active elections error:', error);
    return [];
  }
};

export const updateElection = async (electionId, updates, userId) => {
  try {
    const docRef = doc(db, 'elections', electionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Update election error:', error);
    return { success: false, error: error.message };
  }
};

export const startElection = async (electionId, userId) => {
  try {
    await updateDoc(doc(db, 'elections', electionId), {
      status: ELECTION_STATUS.ACTIVE,
      actualStartTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditAction(userId, AUDIT_ACTIONS.ELECTION_STARTED, {
      electionId
    });

    return { success: true };
  } catch (error) {
    console.error('Start election error:', error);
    return { success: false, error: error.message };
  }
};

export const pauseElection = async (electionId, userId, reason) => {
  try {
    await updateDoc(doc(db, 'elections', electionId), {
      status: ELECTION_STATUS.PAUSED,
      pauseReason: reason,
      pausedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditAction(userId, AUDIT_ACTIONS.ELECTION_PAUSED, {
      electionId,
      reason
    });

    return { success: true };
  } catch (error) {
    console.error('Pause election error:', error);
    return { success: false, error: error.message };
  }
};

export const resumeElection = async (electionId, userId) => {
  try {
    await updateDoc(doc(db, 'elections', electionId), {
      status: ELECTION_STATUS.ACTIVE,
      resumedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditAction(userId, AUDIT_ACTIONS.ELECTION_RESUMED, {
      electionId
    });

    return { success: true };
  } catch (error) {
    console.error('Resume election error:', error);
    return { success: false, error: error.message };
  }
};

export const endElection = async (electionId, userId) => {
  try {
    await updateDoc(doc(db, 'elections', electionId), {
      status: ELECTION_STATUS.COMPLETED,
      actualEndTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditAction(userId, AUDIT_ACTIONS.ELECTION_ENDED, {
      electionId
    });

    return { success: true };
  } catch (error) {
    console.error('End election error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteElection = async (electionId) => {
  try {
    await deleteDoc(doc(db, 'elections', electionId));
    return { success: true };
  } catch (error) {
    console.error('Delete election error:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToElection = (electionId, callback) => {
  const docRef = doc(db, 'elections', electionId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

export const getElectionResults = async (electionId) => {
  try {
    const votesQuery = query(
      collection(db, 'votes'),
      where('electionId', '==', electionId)
    );
    const votesSnapshot = await getDocs(votesQuery);
    
    const results = {};
    votesSnapshot.docs.forEach(doc => {
      const vote = doc.data();
      Object.entries(vote.selections || {}).forEach(([position, candidateId]) => {
        if (!results[position]) {
          results[position] = {};
        }
        results[position][candidateId] = (results[position][candidateId] || 0) + 1;
      });
    });

    return { success: true, data: results };
  } catch (error) {
    console.error('Get election results error:', error);
    return { success: false, error: error.message };
  }
};

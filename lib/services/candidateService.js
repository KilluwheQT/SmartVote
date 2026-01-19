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
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { CANDIDATE_STATUS, AUDIT_ACTIONS } from '../constants';
import { logAuditAction } from './auditService';

export const registerCandidate = async (candidateData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'candidates'), {
      ...candidateData,
      userId,
      status: CANDIDATE_STATUS.PENDING,
      voteCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Register candidate error:', error);
    return { success: false, error: error.message };
  }
};

export const uploadCandidateMedia = async (candidateId, file, type) => {
  try {
    const fileRef = ref(storage, `candidates/${candidateId}/${type}_${Date.now()}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    const updateField = type === 'photo' ? 'photoUrl' : 'videoUrl';
    await updateDoc(doc(db, 'candidates', candidateId), {
      [updateField]: downloadURL,
      updatedAt: serverTimestamp()
    });

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Upload media error:', error);
    return { success: false, error: error.message };
  }
};

export const getCandidate = async (candidateId) => {
  try {
    const docSnap = await getDoc(doc(db, 'candidates', candidateId));
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Candidate not found' };
  } catch (error) {
    console.error('Get candidate error:', error);
    return { success: false, error: error.message };
  }
};

export const getCandidatesByElection = async (electionId) => {
  try {
    const q = query(
      collection(db, 'candidates'),
      where('electionId', '==', electionId),
      where('status', '==', CANDIDATE_STATUS.APPROVED),
      orderBy('position')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get candidates error:', error);
    return [];
  }
};

export const getCandidatesByPosition = async (electionId, position) => {
  try {
    const q = query(
      collection(db, 'candidates'),
      where('electionId', '==', electionId),
      where('position', '==', position),
      where('status', '==', CANDIDATE_STATUS.APPROVED)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get candidates by position error:', error);
    return [];
  }
};

export const getPendingCandidates = async (electionId) => {
  try {
    const q = query(
      collection(db, 'candidates'),
      where('electionId', '==', electionId),
      where('status', '==', CANDIDATE_STATUS.PENDING)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get pending candidates error:', error);
    return [];
  }
};

export const approveCandidate = async (candidateId, adminId) => {
  try {
    await updateDoc(doc(db, 'candidates', candidateId), {
      status: CANDIDATE_STATUS.APPROVED,
      approvedBy: adminId,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditAction(adminId, AUDIT_ACTIONS.CANDIDATE_APPROVED, {
      candidateId
    });

    return { success: true };
  } catch (error) {
    console.error('Approve candidate error:', error);
    return { success: false, error: error.message };
  }
};

export const rejectCandidate = async (candidateId, adminId, reason) => {
  try {
    await updateDoc(doc(db, 'candidates', candidateId), {
      status: CANDIDATE_STATUS.REJECTED,
      rejectedBy: adminId,
      rejectionReason: reason,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditAction(adminId, AUDIT_ACTIONS.CANDIDATE_REJECTED, {
      candidateId,
      reason
    });

    return { success: true };
  } catch (error) {
    console.error('Reject candidate error:', error);
    return { success: false, error: error.message };
  }
};

export const withdrawCandidate = async (candidateId, userId) => {
  try {
    const candidateDoc = await getDoc(doc(db, 'candidates', candidateId));
    if (!candidateDoc.exists()) {
      return { success: false, error: 'Candidate not found' };
    }

    const candidateData = candidateDoc.data();
    
    // Check if election has started
    const electionDoc = await getDoc(doc(db, 'elections', candidateData.electionId));
    if (electionDoc.exists() && electionDoc.data().status === 'active') {
      return { success: false, error: 'Cannot withdraw after election has started' };
    }

    await updateDoc(doc(db, 'candidates', candidateId), {
      status: CANDIDATE_STATUS.WITHDRAWN,
      withdrawnAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Withdraw candidate error:', error);
    return { success: false, error: error.message };
  }
};

export const updateCandidatePlatform = async (candidateId, platform) => {
  try {
    await updateDoc(doc(db, 'candidates', candidateId), {
      platform,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Update platform error:', error);
    return { success: false, error: error.message };
  }
};

export const getCandidateVoteCount = async (candidateId, electionId) => {
  try {
    const q = query(
      collection(db, 'votes'),
      where('electionId', '==', electionId)
    );
    const snapshot = await getDocs(q);
    
    let count = 0;
    snapshot.docs.forEach(doc => {
      const selections = doc.data().selections || {};
      Object.values(selections).forEach(selectedId => {
        if (selectedId === candidateId) count++;
      });
    });

    return count;
  } catch (error) {
    console.error('Get vote count error:', error);
    return 0;
  }
};

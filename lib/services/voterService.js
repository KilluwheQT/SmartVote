import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { VOTER_STATUS, AUDIT_ACTIONS, USER_ROLES } from '../constants';
import { logAuditAction } from './auditService';

export const importVoters = async (votersData, electionId, userId) => {
  try {
    const batch = writeBatch(db);
    const importedCount = { success: 0, failed: 0, errors: [] };

    for (const voter of votersData) {
      try {
        const voterRef = doc(collection(db, 'voters'));
        batch.set(voterRef, {
          ...voter,
          electionId,
          status: VOTER_STATUS.NOT_VOTED,
          importedAt: serverTimestamp(),
          importedBy: userId
        });
        importedCount.success++;
      } catch (err) {
        importedCount.failed++;
        importedCount.errors.push({ voter: voter.studentId, error: err.message });
      }
    }

    await batch.commit();

    await logAuditAction(userId, AUDIT_ACTIONS.VOTER_IMPORTED, {
      electionId,
      totalImported: importedCount.success,
      totalFailed: importedCount.failed
    });

    return { success: true, ...importedCount };
  } catch (error) {
    console.error('Import voters error:', error);
    return { success: false, error: error.message };
  }
};

export const getVotersByElection = async (electionId) => {
  try {
    const q = query(
      collection(db, 'voters'),
      where('electionId', '==', electionId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get voters error:', error);
    return [];
  }
};

export const checkVoterEligibility = async (userId, electionId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { eligible: false, reason: 'User not found' };
    }

    const userData = userDoc.data();
    
    // Super Admin and Election Officers cannot vote
    if (userData.role === USER_ROLES.SUPER_ADMIN || userData.role === USER_ROLES.ELECTION_OFFICER) {
      return { eligible: false, reason: 'Administrators cannot vote in elections' };
    }
    
    // Check if user is blocked or inactive
    if (userData.status === 'blocked' || userData.status === 'inactive') {
      return { eligible: false, reason: 'Account is blocked or inactive' };
    }

    // Get election details
    const electionDoc = await getDoc(doc(db, 'elections', electionId));
    if (!electionDoc.exists()) {
      return { eligible: false, reason: 'Election not found' };
    }

    const electionData = electionDoc.data();

    // Check eligibility criteria
    if (electionData.eligibilityCriteria) {
      const criteria = electionData.eligibilityCriteria;
      
      if (criteria.gradeLevels && !criteria.gradeLevels.includes(userData.gradeLevel)) {
        return { eligible: false, reason: 'Grade level not eligible' };
      }
      
      if (criteria.departments && !criteria.departments.includes(userData.department)) {
        return { eligible: false, reason: 'Department not eligible' };
      }
      
      if (criteria.sections && !criteria.sections.includes(userData.section)) {
        return { eligible: false, reason: 'Section not eligible' };
      }
    }

    // Check if already voted
    const voteQuery = query(
      collection(db, 'votes'),
      where('voterId', '==', userId),
      where('electionId', '==', electionId)
    );
    const voteSnapshot = await getDocs(voteQuery);
    
    if (!voteSnapshot.empty) {
      return { eligible: false, reason: 'Already voted in this election' };
    }

    return { eligible: true };
  } catch (error) {
    console.error('Check eligibility error:', error);
    return { eligible: false, reason: error.message };
  }
};

export const updateVoterStatus = async (voterId, status, userId) => {
  try {
    await updateDoc(doc(db, 'voters', voterId), {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    });

    if (status === VOTER_STATUS.BLOCKED) {
      await logAuditAction(userId, AUDIT_ACTIONS.VOTER_BLOCKED, {
        voterId
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Update voter status error:', error);
    return { success: false, error: error.message };
  }
};

export const getVoterTurnout = async (electionId) => {
  try {
    const votersQuery = query(
      collection(db, 'voters'),
      where('electionId', '==', electionId)
    );
    const votersSnapshot = await getDocs(votersQuery);
    
    const totalVoters = votersSnapshot.size;
    const votedCount = votersSnapshot.docs.filter(
      doc => doc.data().status === VOTER_STATUS.VOTED
    ).length;

    return {
      total: totalVoters,
      voted: votedCount,
      percentage: totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0
    };
  } catch (error) {
    console.error('Get voter turnout error:', error);
    return { total: 0, voted: 0, percentage: 0 };
  }
};

export const getVoterStatistics = async (electionId) => {
  try {
    const voters = await getVotersByElection(electionId);
    
    const stats = {
      byGradeLevel: {},
      byDepartment: {},
      bySection: {},
      byStatus: {}
    };

    voters.forEach(voter => {
      // By grade level
      stats.byGradeLevel[voter.gradeLevel] = stats.byGradeLevel[voter.gradeLevel] || { total: 0, voted: 0 };
      stats.byGradeLevel[voter.gradeLevel].total++;
      if (voter.status === VOTER_STATUS.VOTED) {
        stats.byGradeLevel[voter.gradeLevel].voted++;
      }

      // By department
      stats.byDepartment[voter.department] = stats.byDepartment[voter.department] || { total: 0, voted: 0 };
      stats.byDepartment[voter.department].total++;
      if (voter.status === VOTER_STATUS.VOTED) {
        stats.byDepartment[voter.department].voted++;
      }

      // By section
      stats.bySection[voter.section] = stats.bySection[voter.section] || { total: 0, voted: 0 };
      stats.bySection[voter.section].total++;
      if (voter.status === VOTER_STATUS.VOTED) {
        stats.bySection[voter.section].voted++;
      }

      // By status
      stats.byStatus[voter.status] = (stats.byStatus[voter.status] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Get voter statistics error:', error);
    return null;
  }
};

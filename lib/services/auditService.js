import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase';

export const logAuditAction = async (userId, action, details = {}) => {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      userId,
      action,
      details,
      timestamp: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      ipAddress: 'client-side'
    });
    return { success: true };
  } catch (error) {
    console.error('Audit log error:', error);
    return { success: false, error: error.message };
  }
};

export const getAuditLogs = async (filters = {}) => {
  try {
    let q = collection(db, 'auditLogs');
    const constraints = [orderBy('timestamp', 'desc')];

    if (filters.userId) {
      constraints.unshift(where('userId', '==', filters.userId));
    }
    if (filters.action) {
      constraints.unshift(where('action', '==', filters.action));
    }
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }

    q = query(q, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    // Fallback for missing index
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not ready for audit logs, using fallback query.');
      try {
        const fallbackQuery = filters.limit 
          ? query(collection(db, 'auditLogs'), limit(filters.limit))
          : query(collection(db, 'auditLogs'));
        const snapshot = await getDocs(fallbackQuery);
        
        let logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));

        // Filter client-side
        if (filters.userId) {
          logs = logs.filter(log => log.userId === filters.userId);
        }
        if (filters.action) {
          logs = logs.filter(log => log.action === filters.action);
        }

        // Sort client-side
        return logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      } catch (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        return [];
      }
    }
    console.error('Get audit logs error:', error);
    return [];
  }
};

export const getElectionAuditLogs = async (electionId) => {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      where('details.electionId', '==', electionId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    // Fallback for missing index
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not ready for election audit logs, using fallback.');
      try {
        const snapshot = await getDocs(collection(db, 'auditLogs'));
        
        let logs = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }))
          .filter(log => log.details?.electionId === electionId);

        return logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      } catch (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        return [];
      }
    }
    console.error('Get election audit logs error:', error);
    return [];
  }
};

export const generateIntegrityReport = async (electionId) => {
  try {
    const logs = await getElectionAuditLogs(electionId);
    
    const report = {
      electionId,
      generatedAt: new Date(),
      totalActions: logs.length,
      actionBreakdown: {},
      timeline: [],
      anomalies: []
    };

    logs.forEach(log => {
      report.actionBreakdown[log.action] = (report.actionBreakdown[log.action] || 0) + 1;
      report.timeline.push({
        action: log.action,
        timestamp: log.timestamp,
        userId: log.userId
      });
    });

    return report;
  } catch (error) {
    console.error('Generate integrity report error:', error);
    return null;
  }
};

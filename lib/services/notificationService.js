import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { NOTIFICATION_TYPES } from '../constants';

export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false, error: error.message };
  }
};

export const getUserNotifications = async (userId) => {
  try {
    // Try with orderBy first (requires composite index)
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    // Fallback: query without orderBy and sort client-side
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not ready, using client-side sorting. Create index at Firebase Console.');
      try {
        const fallbackQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(fallbackQuery);
        
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        
        // Sort client-side
        return notifications.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      } catch (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        return [];
      }
    }
    console.error('Get notifications error:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Mark notification read error:', error);
    return { success: false, error: error.message };
  }
};

export const sendBulkNotification = async (userIds, type, title, message, data = {}) => {
  try {
    const promises = userIds.map(userId => 
      createNotification(userId, type, title, message, data)
    );
    await Promise.all(promises);
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error('Bulk notification error:', error);
    return { success: false, error: error.message };
  }
};

export const sendElectionStartNotification = async (electionId, electionName, voterIds) => {
  return sendBulkNotification(
    voterIds,
    NOTIFICATION_TYPES.ELECTION_START,
    'Election Started',
    `The election "${electionName}" has started. Cast your vote now!`,
    { electionId }
  );
};

export const sendElectionEndReminder = async (electionId, electionName, voterIds) => {
  return sendBulkNotification(
    voterIds,
    NOTIFICATION_TYPES.ELECTION_END,
    'Election Ending Soon',
    `The election "${electionName}" is ending soon. Don't forget to vote!`,
    { electionId }
  );
};

export const sendWinnerAnnouncement = async (electionId, electionName, voterIds) => {
  return sendBulkNotification(
    voterIds,
    NOTIFICATION_TYPES.WINNER_ANNOUNCEMENT,
    'Election Results Available',
    `The results for "${electionName}" are now available. View the winners!`,
    { electionId }
  );
};

export const sendVotingReminder = async (userId, electionId, electionName) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.VOTING_REMINDER,
    'Voting Reminder',
    `You haven't voted yet in "${electionName}". Cast your vote before it ends!`,
    { electionId }
  );
};

export const getUnreadCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
};

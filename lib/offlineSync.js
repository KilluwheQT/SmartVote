/**
 * Offline Voting with Secure Data Sync
 * 
 * This module handles offline vote storage and synchronization
 * when the device comes back online.
 */

import { openDB } from 'idb';
import { encryptVote, generateVoteHash } from './encryption';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const DB_NAME = 'smartvote_offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending_votes';

// Initialize IndexedDB
export const initOfflineDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('electionId', 'electionId');
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('synced', 'synced');
      }
    }
  });
};

// Check if online
export const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Store vote offline
export const storeOfflineVote = async (voteData) => {
  try {
    const db = await initOfflineDB();
    
    // Encrypt vote before storing
    const encryptedSelections = encryptVote(voteData.selections);
    const voteHash = generateVoteHash(voteData.selections, voteData.voterId);
    const receipt = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    const offlineVote = {
      voterId: voteData.voterId,
      electionId: voteData.electionId,
      encryptedSelections,
      voteHash,
      receipt,
      timestamp: new Date().toISOString(),
      synced: false,
      syncAttempts: 0
    };

    await db.add(STORE_NAME, offlineVote);
    
    return { 
      success: true, 
      receipt,
      message: 'Vote saved offline. Will sync when online.' 
    };
  } catch (error) {
    console.error('Offline vote storage error:', error);
    return { success: false, error: error.message };
  }
};

// Get pending offline votes
export const getPendingVotes = async () => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(tx);
    const index = store.index('synced');
    
    return await index.getAll(false);
  } catch (error) {
    console.error('Get pending votes error:', error);
    return [];
  }
};

// Sync a single vote
const syncVote = async (offlineVote) => {
  try {
    const docRef = await addDoc(collection(db, 'votes'), {
      voterId: offlineVote.voterId,
      electionId: offlineVote.electionId,
      encryptedSelections: offlineVote.encryptedSelections,
      voteHash: offlineVote.voteHash,
      receipt: offlineVote.receipt,
      timestamp: serverTimestamp(),
      offlineTimestamp: offlineVote.timestamp,
      verified: true,
      syncedFromOffline: true
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Sync vote error:', error);
    return { success: false, error: error.message };
  }
};

// Mark vote as synced
const markVoteSynced = async (voteId) => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(tx);
    
    const vote = await store.get(voteId);
    if (vote) {
      vote.synced = true;
      vote.syncedAt = new Date().toISOString();
      await store.put(vote);
    }
  } catch (error) {
    console.error('Mark synced error:', error);
  }
};

// Increment sync attempts
const incrementSyncAttempts = async (voteId) => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(tx);
    
    const vote = await store.get(voteId);
    if (vote) {
      vote.syncAttempts = (vote.syncAttempts || 0) + 1;
      vote.lastAttempt = new Date().toISOString();
      await store.put(vote);
    }
  } catch (error) {
    console.error('Increment attempts error:', error);
  }
};

// Sync all pending votes
export const syncPendingVotes = async () => {
  if (!isOnline()) {
    return { success: false, message: 'Device is offline' };
  }

  try {
    const pendingVotes = await getPendingVotes();
    
    if (pendingVotes.length === 0) {
      return { success: true, synced: 0, message: 'No pending votes' };
    }

    let synced = 0;
    let failed = 0;

    for (const vote of pendingVotes) {
      // Skip if too many attempts
      if (vote.syncAttempts >= 5) {
        continue;
      }

      const result = await syncVote(vote);
      
      if (result.success) {
        await markVoteSynced(vote.id);
        synced++;
      } else {
        await incrementSyncAttempts(vote.id);
        failed++;
      }
    }

    return { 
      success: true, 
      synced, 
      failed,
      message: `Synced ${synced} votes, ${failed} failed` 
    };
  } catch (error) {
    console.error('Sync pending votes error:', error);
    return { success: false, error: error.message };
  }
};

// Clear synced votes
export const clearSyncedVotes = async () => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(tx);
    const index = store.index('synced');
    
    const syncedVotes = await index.getAllKeys(true);
    
    for (const key of syncedVotes) {
      await store.delete(key);
    }

    return { success: true, cleared: syncedVotes.length };
  } catch (error) {
    console.error('Clear synced votes error:', error);
    return { success: false, error: error.message };
  }
};

// Setup online/offline listeners
export const setupOfflineSync = (onStatusChange) => {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    onStatusChange?.('online');
    
    // Auto-sync when coming online
    const result = await syncPendingVotes();
    if (result.synced > 0) {
      console.log(`Auto-synced ${result.synced} offline votes`);
    }
  };

  const handleOffline = () => {
    onStatusChange?.('offline');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial check
  if (isOnline()) {
    syncPendingVotes();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Get offline status
export const getOfflineStatus = async () => {
  const pendingVotes = await getPendingVotes();
  
  return {
    isOnline: isOnline(),
    pendingCount: pendingVotes.length,
    pendingVotes: pendingVotes.map(v => ({
      electionId: v.electionId,
      timestamp: v.timestamp,
      receipt: v.receipt,
      syncAttempts: v.syncAttempts
    }))
  };
};

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAjVvny-w3CBHOxV2ZMqYwW2tz-gh44Xv0",
  authDomain: "smartvote-a2ba9.firebaseapp.com",
  databaseURL: "https://smartvote-a2ba9-default-rtdb.firebaseio.com",
  projectId: "smartvote-a2ba9",
  storageBucket: "smartvote-a2ba9.firebasestorage.app",
  messagingSenderId: "691887367704",
  appId: "1:691887367704:web:86ed9631d29555d948c56d",
  measurementId: "G-LNX4NVW59E"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { app, auth, db, storage, rtdb };

/**
 * Seed Script for Super Admin and Election Officer accounts
 * 
 * Run this script once to create initial admin accounts:
 * node scripts/seedAdmins.js
 * 
 * Make sure to update the Firebase config and credentials before running.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - same as lib/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyCGiVwWUBiqRMImqxs6Y1jJqzPpXsLj8qo",
  authDomain: "smartvote-a2ba9.firebaseapp.com",
  projectId: "smartvote-a2ba9",
  storageBucket: "smartvote-a2ba9.firebasestorage.app",
  messagingSenderId: "1052837633614",
  appId: "1:1052837633614:web:c2c3e8e0d4f8e8e8e8e8e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin accounts to create
const adminAccounts = [
  {
    email: 'superadmin@smartvote.edu',
    password: 'SuperAdmin@2024!',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    department: 'Administration',
    studentId: 'ADMIN-001'
  },
  {
    email: 'officer@smartvote.edu',
    password: 'Officer@2024!',
    firstName: 'Election',
    lastName: 'Officer',
    role: 'election_officer',
    department: 'Student Affairs',
    studentId: 'OFFICER-001'
  }
];

async function createAdminAccount(accountData) {
  try {
    console.log(`Creating account for ${accountData.email}...`);
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      accountData.email,
      accountData.password
    );
    
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, {
      displayName: `${accountData.firstName} ${accountData.lastName}`
    });
    
    // Create Firestore user document
    await setDoc(doc(db, 'users', user.uid), {
      email: accountData.email,
      firstName: accountData.firstName,
      lastName: accountData.lastName,
      role: accountData.role,
      department: accountData.department,
      studentId: accountData.studentId,
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✓ Created ${accountData.role}: ${accountData.email}`);
    console.log(`  Password: ${accountData.password}`);
    console.log(`  UID: ${user.uid}`);
    console.log('');
    
    return { success: true, uid: user.uid };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠ Account already exists: ${accountData.email}`);
      return { success: false, error: 'Already exists' };
    }
    console.error(`✗ Error creating ${accountData.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function seedAdmins() {
  console.log('========================================');
  console.log('SmartVote Admin Account Seeder');
  console.log('========================================\n');
  
  for (const account of adminAccounts) {
    await createAdminAccount(account);
  }
  
  console.log('========================================');
  console.log('Seeding complete!');
  console.log('========================================\n');
  console.log('You can now login with these accounts:');
  console.log('');
  console.log('Super Admin:');
  console.log('  Email: superadmin@smartvote.edu');
  console.log('  Password: SuperAdmin@2024!');
  console.log('');
  console.log('Election Officer:');
  console.log('  Email: officer@smartvote.edu');
  console.log('  Password: Officer@2024!');
  console.log('');
  
  process.exit(0);
}

seedAdmins().catch(console.error);

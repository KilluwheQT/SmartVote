'use client';

import { useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  PhoneAuthProvider,
  RecaptchaVerifier,
  multiFactor,
  PhoneMultiFactorGenerator
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthStore } from '../store';
import { USER_ROLES, AUDIT_ACTIONS } from '../constants';
import { logAuditAction } from '../services/auditService';

export const useAuth = () => {
  const { user, userRole, isAuthenticated, loading, setUser, setUserRole, logout: storeLogout, setLoading } = useAuthStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({ ...firebaseUser, ...userData });
            setUserRole(userData.role || USER_ROLES.VOTER);
          } else {
            setUser(firebaseUser);
            setUserRole(USER_ROLES.VOTER);
          }
        } catch (err) {
          // Handle offline or network errors gracefully
          console.warn('Failed to fetch user data, using cached auth:', err.message);
          setUser(firebaseUser);
          setUserRole(USER_ROLES.VOTER);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserRole, setLoading]);

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      await updateDoc(doc(db, 'users', result.user.uid), {
        lastLogin: serverTimestamp(),
        lastLoginIP: 'client-side'
      });

      // Log audit action
      await logAuditAction(result.user.uid, AUDIT_ACTIONS.LOGIN, {
        email: result.user.email
      });

      return { success: true, user: result.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (email, password, userData) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Create user document
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        studentId: userData.studentId,
        gradeLevel: userData.gradeLevel,
        section: userData.section,
        department: userData.department,
        role: USER_ROLES.VOTER,
        status: 'active',
        hasVoted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        consentAccepted: false,
        termsAccepted: false
      });

      return { success: true, user: result.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await logAuditAction(user.uid, AUDIT_ACTIONS.LOGOUT, {
          email: user.email
        });
      }
      await signOut(auth);
      storeLogout();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const setup2FA = async (phoneNumber) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });

      const session = await multiFactor(auth.currentUser).getSession();
      const phoneInfoOptions = {
        phoneNumber,
        session
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
      
      return { success: true, verificationId };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const verify2FA = async (verificationId, verificationCode) => {
    try {
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(auth.currentUser).enroll(multiFactorAssertion, 'Phone Number');
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        twoFactorEnabled: true,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    user,
    userRole,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    setup2FA,
    verify2FA
  };
};

export default useAuth;

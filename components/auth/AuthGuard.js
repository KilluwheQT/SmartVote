'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { USER_ROLES } from '@/lib/constants';

const AuthGuard = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { user, userRole, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login');
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, userRole, allowedRoles, requireAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
};

export const AdminGuard = ({ children }) => (
  <AuthGuard allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ELECTION_OFFICER]}>
    {children}
  </AuthGuard>
);

export const SuperAdminGuard = ({ children }) => (
  <AuthGuard allowedRoles={[USER_ROLES.SUPER_ADMIN]}>
    {children}
  </AuthGuard>
);

export default AuthGuard;

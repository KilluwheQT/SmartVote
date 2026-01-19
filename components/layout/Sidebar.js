'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Vote, 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings,
  FileText,
  Shield,
  Bell,
  History,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { USER_ROLES } from '@/lib/constants';

const Sidebar = () => {
  const pathname = usePathname();
  const { userRole } = useAuth();

  const isAdmin = userRole === USER_ROLES.SUPER_ADMIN || userRole === USER_ROLES.ELECTION_OFFICER;
  const isSuperAdmin = userRole === USER_ROLES.SUPER_ADMIN;

  const voterNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Active Elections', href: '/elections', icon: Vote },
    { name: 'My Votes', href: '/my-votes', icon: History },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Elections', href: '/admin/elections', icon: Vote },
    { name: 'Voters', href: '/admin/voters', icon: Users },
    { name: 'Candidates', href: '/admin/candidates', icon: UserCheck },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
  ];

  const superAdminNavigation = [
    { name: 'User Management', href: '/admin/users', icon: Shield },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <Link
        href={item.href}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors
          ${isActive 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen p-4">
      <nav className="space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Voter
          </h3>
          <div className="mt-2 space-y-1">
            {voterNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        {isAdmin && (
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Administration
            </h3>
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}

        {isSuperAdmin && (
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Super Admin
            </h3>
            <div className="mt-2 space-y-1">
              {superAdminNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <HelpCircle className="w-5 h-5" />
            Help & Support
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

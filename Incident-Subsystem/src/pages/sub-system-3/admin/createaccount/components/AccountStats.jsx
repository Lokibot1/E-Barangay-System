import React from 'react';
import { Crown, UserX, Users } from 'lucide-react';
import { StatCard } from './FormFields';

const AccountStats = ({ isDark, staffActiveCount, staffInactiveCount, totalAdmins }) => (
  <div className="grid grid-cols-3 gap-3">
    <StatCard
      isDark={isDark}
      label="Active"
      value={staffActiveCount}
      icon={Users}
      color={isDark ? 'border-emerald-700/40 bg-emerald-900/20 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}
    />
    <StatCard
      isDark={isDark}
      label="Inactive"
      value={staffInactiveCount}
      icon={UserX}
      color={isDark ? 'border-rose-700/40 bg-rose-900/20 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-800'}
    />
    <StatCard
      isDark={isDark}
      label="Admins"
      value={totalAdmins}
      icon={Crown}
      color={isDark ? 'border-violet-700/40 bg-violet-900/20 text-violet-300' : 'border-violet-200 bg-violet-50 text-violet-800'}
    />
  </div>
);

export default AccountStats;


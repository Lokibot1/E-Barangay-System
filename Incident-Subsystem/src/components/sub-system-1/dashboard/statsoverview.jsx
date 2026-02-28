import React from 'react';
import StatCard from '../common/statcard';
import { Users, Home, CheckCircle, Clock } from 'lucide-react';

const StatsOverview = ({ stats }) => {
  const displayData = stats || { 
    totalResidents: 0, 
    households: 0, 
    verifiedIds: 0, 
    pendingVerification: 0 
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard 
        title="Total Residents" 
        value={displayData.totalResidents} 
        subtitle="Registered residents" 
        icon={Users} 
        color="emerald" 
      />
      <StatCard 
        title="Households" 
        value={displayData.households} 
        subtitle="Registered households" 
        icon={Home} 
        color="blue" 
      />
      <StatCard 
        title="Verified IDs" 
        value={displayData.verifiedIds} 
        subtitle="Verified residents" 
        icon={CheckCircle} 
        color="emerald" 
      />
      <StatCard 
        title="Pending Verification" 
        value={displayData.pendingVerification} 
        subtitle="ID submissions" 
        icon={Clock} 
        color="amber" 
      />
    </div>
  );
};

export default StatsOverview;
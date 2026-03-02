import React, { useMemo } from 'react';
import { Users, UserCheck, ShieldCheck, HeartPulse } from 'lucide-react';
import StatCard from '../common/statcard';

const ResidentStats = ({ residents, t }) => {
  const statsData = useMemo(() => {
    if (!residents || !residents.length) return [];
    
    const getSectorCount = (cat) => residents.filter(r => {
      const s = (typeof r.sector === 'object' ? r.sector?.name : r.sector) || '';
      return s.toUpperCase() === cat.toUpperCase();
    }).length;

    return [
      { 
        title: 'Total Population', 
        value: residents.length, 
        subtitle: 'Official Records', 
        icon: Users, 
        color: 'blue' 
      },
      { 
        title: 'Voter Census', 
        value: residents.filter(r => r.is_voter == 1 || r.is_voter === 'Yes').length, 
        subtitle: 'Qualified Voters', 
        icon: UserCheck, 
        color: 'emerald' 
      },
      { 
        title: 'Senior Citizens', 
        value: getSectorCount('SENIOR CITIZEN'), 
        subtitle: 'Aged 60 & Above', 
        icon: ShieldCheck, 
        color: 'amber' 
      },
      { 
        title: 'Priority Groups', 
        value: getSectorCount('PWD') + getSectorCount('SOLO PARENT'), 
        subtitle: 'PWD & Solo Parents', 
        icon: HeartPulse, 
        color: 'rose' 
      },
    ];
  }, [residents]); // Re-renders only if original list changes

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, idx) => (
        <StatCard key={idx} {...stat} t={t} />
      ))}
    </div>
  );
};

export default ResidentStats;
import React from 'react';
import { Home, Users, Landmark, MapPin } from 'lucide-react';
import StatCard from '../common/statcard';
const HouseholdStats = ({ stats, t }) => {
  const cards = [
    {
      title: 'Total Households',
      value: stats.total,
      subtitle: 'Registered Family Units',
      icon: Home,
      color: 'blue'
    },
    {
      title: 'Indigent Families',
      value: stats.indigents,
      subtitle: 'DSWD Priority List',
      icon: Landmark,
      color: 'amber'
    },
    {
      title: 'Home Owners',
      value: stats.owners,
      subtitle: `${stats.ownerPercent}% of Total Units`,
      icon: MapPin,
      color: 'emerald'
    },
    {
      title: 'Priority Heads',
      value: stats.priority,
      subtitle: 'Senior or PWD Headed',
      icon: Users,
      color: 'rose'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <StatCard key={idx} {...card} t={t} />
      ))}
    </div>
  );
};

export default HouseholdStats;
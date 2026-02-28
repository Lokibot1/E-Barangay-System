import React, { useMemo } from 'react';
import { Clock, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import StatCard from '../common/statcard';

const VerificationStats = ({ submissions = [] }) => {
  const stats = useMemo(() => {
  const counts = { pending: 0, forVerification: 0, verified: 0, rejected: 0 };

  submissions.forEach(s => {
    const status = s.status?.toLowerCase();
    if (status === 'pending') counts.pending++;
    else if (status === 'for verification') counts.forVerification++;
    else if (status === 'verified') counts.verified++; 
    else if (status === 'rejected') counts.rejected++;
  });

  return counts;
}, [submissions]);

  const statsConfig = [
    {
      title: 'Pending',
      value: stats.pending,
      subtitle: 'Awaiting Review',
      icon: Clock,
      color: 'amber' 
    },
    {
      title: 'For Verification',
      value: stats.forVerification,
      subtitle: 'On-site Check',
      icon: MapPin,
      color: 'blue'
    },
    {
      title: 'Verified',
      value: stats.verified,
      subtitle: 'Approved Records',
      icon: CheckCircle2,
      color: 'emerald'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      subtitle: 'Denied Submissions',
      icon: XCircle,
      color: 'red'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statsConfig.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default VerificationStats;
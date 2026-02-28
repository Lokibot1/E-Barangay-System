import React from 'react';
import DetailHeader from './details/DetailHeader';
import IdentitySection from './details/IdentitySection';
import ResidencySection from './details/ResidencySection';
import EconomicSection from './details/EconomicSection';
import Profile from './details/Profile';

const VerificationDetailView = (props) => {
  const { data, onZoom, t } = props;

  const combinedDetails = {
    ...data?.details,
    tenureStatus: data?.registration_payload?.tenure_status,
    wallMaterial: data?.registration_payload?.wall_material,
    roofMaterial: data?.registration_payload?.roof_material,
    waterSource: data?.registration_payload?.water_source,
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12">
      {/* Navigation & Header */}
      <DetailHeader {...props} t={t} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Areas */}
        <div className="lg:col-span-2 space-y-6">
          <IdentitySection details={combinedDetails} onZoom={onZoom} t={t} />
          <ResidencySection details={combinedDetails} t={t} />
          <EconomicSection details={combinedDetails} t={t} />
        </div>

        {/* Sticky Sidebar */}
        <Profile data={data} details={combinedDetails} t={t} />
      </div>
    </div>
  );
};

export default VerificationDetailView;

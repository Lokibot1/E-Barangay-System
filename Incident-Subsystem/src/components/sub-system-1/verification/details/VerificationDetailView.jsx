// 1. IMPORT: Idagdag ang useMemo dito
import React, { useState, useEffect, useMemo } from 'react'; 
import DetailHeader from '../details/DetailHeader';
import IdentitySection from '../details/IdentitySection';
import ResidencySection from '../details/ResidencySection';
import EconomicSection from '../details/EconomicSection';
import Profile from '../details/Profile';

const VerificationDetailView = (props) => {
  const { data, onZoom, t, onApprove } = props;

  const householdExists = data?.household_exists; 
  const isNewHousehold = householdExists === false || householdExists === 0;

  const [isIndigent, setIsIndigent] = useState(0);

  useEffect(() => {
    if (householdExists && data?.household_indigent_status !== undefined) {
      setIsIndigent(data?.household_indigent_status ? 1 : 0);
    }
  }, [data, householdExists]);

  const combinedDetails = useMemo(() => ({
    ...data?.details,
    tenureStatus: data?.registration_payload?.tenure_status || data?.details?.tenureStatus,
    wallMaterial: data?.registration_payload?.wall_material || data?.details?.wallMaterial,
    roofMaterial: data?.registration_payload?.roof_material || data?.details?.roofMaterial,
    waterSource: data?.registration_payload?.water_source || data?.details?.waterSource,
  }), [data]);

  const handleApproveClick = () => {
    if (onApprove) {
      onApprove(isIndigent, {
        tenureStatus: combinedDetails.tenureStatus,
        wallMaterial: combinedDetails.wallMaterial,
        roofMaterial: combinedDetails.roofMaterial,
        waterSource: combinedDetails.waterSource
      });
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12">
      <DetailHeader {...props} t={t} onApprove={handleApproveClick} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <IdentitySection details={combinedDetails} onZoom={onZoom} t={t} />
          <ResidencySection details={combinedDetails} t={t} />
          
          <EconomicSection 
            details={combinedDetails} 
            t={t} 
            isIndigent={isIndigent}
            setIsIndigent={setIsIndigent}
            isNewHousehold={isNewHousehold} 
          />
        </div>

        <Profile 
          data={data} 
          details={combinedDetails} 
          t={t} 
          isIndigent={isIndigent}
        />
      </div>
    </div>
  );
};

export default VerificationDetailView;
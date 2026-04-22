import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import DetailHeader from '../details/DetailHeader';
import IdentitySection from '../details/IdentitySection';
import ResidencySection from '../details/ResidencySection';
import EconomicSection from '../details/EconomicSection';
import Profile from '../details/Profile';
import ProgressSection from '../details/ProgressSection';
import RejectionModal from '../modals/RejectionModal';

const VerificationDetailView = (props) => {
  const { data, onZoom, t, onApprove, onReject, currentTheme } = props;

  const [isIndigent, setIsIndigent] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const householdPosition = (data?.details?.householdPosition || data?.household_position || '').toLowerCase();
  const isHead = householdPosition === 'head' || householdPosition === 'head of family';
  const householdExists = data?.household_exists;
  const isNewHousehold = householdExists === false || householdExists === 0;
  const existingIndigentStatus = data?.household_indigent_status;

  useEffect(() => {
    if (!isHead) { setIsIndigent(0); return; }
    if (!isNewHousehold && existingIndigentStatus != null) {
      setIsIndigent(existingIndigentStatus ? 1 : 0);
    } else { setIsIndigent(0); }
  }, [data, isHead, isNewHousehold, existingIndigentStatus]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previousOverflow = document.body.style.overflow;
    if (showRejectModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showRejectModal]);

  const combinedDetails = useMemo(() => {
    const payload = data?.registration_payload || {};
    const household = data?.household || {};

    return {
      ...data?.details,
      household,
      tenureStatus:     payload.tenure_status   || household.tenure_status   || data?.details?.tenureStatus,
      wallMaterial:     payload.wall_material    || household.wall_material    || data?.details?.wallMaterial,
      roofMaterial:     payload.roof_material    || household.roof_material    || data?.details?.roofMaterial,
      waterSource:      payload.water_source     || household.water_source     || data?.details?.waterSource,
      numberOfFamilies: payload.num_families_reported || household.num_families_reported || data?.details?.numberOfFamilies || 1,
    };
  }, [data]);

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }).format(date);
    } catch (e) { return dateString; }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-20">
      <DetailHeader
        {...props}
        t={t}
        onApprove={() => onApprove(isHead ? isIndigent : 0, combinedDetails)}
        onRejectClick={() => setShowRejectModal(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
        <div className="lg:col-span-2 space-y-6">
          <IdentitySection details={combinedDetails} onZoom={onZoom} t={t} currentTheme={currentTheme} />
          <ResidencySection details={combinedDetails} t={t} />
          <EconomicSection
            details={combinedDetails}
            t={t}
            isIndigent={isIndigent}
            setIsIndigent={setIsIndigent}
            isNewHousehold={isNewHousehold}
            isHead={isHead}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-8 flex flex-col gap-0 h-fit">
          <div className="z-10">
            <Profile data={data} details={combinedDetails} t={t} isIndigent={isIndigent} isHead={isHead} />
          </div>
          <div className="mx-8 h-px bg-slate-800/50" />
          <div className="mt-[-1px]">
            <ProgressSection data={data} formatDate={formatDate} />
          </div>
        </div>
      </div>

      {/* Rejection Modal — replaces the old inline portal */}
      <RejectionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={(reason, remarks) => {
          onReject(reason, remarks);
          setShowRejectModal(false);
        }}
        theme={t}
      />
    </div>
  );
};

export default VerificationDetailView;
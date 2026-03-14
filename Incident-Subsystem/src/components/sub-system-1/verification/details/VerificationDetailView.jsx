/**
 * VerificationDetailView.jsx
 *
 * FIXED: Now passes `isHead` prop explicitly to EconomicSection and Profile.
 * Previously EconomicSection re-derived isHead from details?.householdPosition
 * using an unreliable string check — causing the toggle to stay locked even
 * for actual Heads. The fix is simple: compute once here, pass down.
 *
 * Indigency toggle rules:
 *   - isHead = true  → toggle is enabled (Head sets household indigent status)
 *   - isHead = false → toggle is locked (read-only, inherited from household)
 *   - Existing HH    → pre-filled with current household_indigent_status
 *   - New HH         → defaults to 0
 */

import React, { useState, useEffect, useMemo } from 'react';
import DetailHeader from '../details/DetailHeader';
import IdentitySection from '../details/IdentitySection';
import ResidencySection from '../details/ResidencySection';
import EconomicSection from '../details/EconomicSection';
import Profile from '../details/Profile';

const VerificationDetailView = (props) => {
  const { data, onZoom, t, onApprove, currentTheme } = props;

  // ── Compute isHead once — single source of truth ────────────────────────────
  const householdPosition = (
    data?.details?.householdPosition ||
    data?.household_position ||
    ''
  ).toLowerCase();

  const isHead = householdPosition === 'head' || householdPosition === 'head of family';

  const householdExists        = data?.household_exists;
  const isNewHousehold         = householdExists === false || householdExists === 0;
  const existingIndigentStatus = data?.household_indigent_status;

  // ── Indigency state ─────────────────────────────────────────────────────────
  const [isIndigent, setIsIndigent] = useState(0);

  useEffect(() => {
    if (!isHead) {
      setIsIndigent(0);
      return;
    }
    // Existing household: carry current status; new household: default 0
    if (!isNewHousehold && existingIndigentStatus != null) {
      setIsIndigent(existingIndigentStatus ? 1 : 0);
    } else {
      setIsIndigent(0);
    }
  }, [data, isHead, isNewHousehold, existingIndigentStatus]);

  // ── Merge registration_payload into details ─────────────────────────────────
  const combinedDetails = useMemo(() => {
  // Kunin natin yung payload
  const payload = data?.registration_payload || {};
  
  return {
    ...data?.details,
    tenureStatus: payload.tenure_status || data?.details?.tenureStatus,
    wallMaterial: payload.wall_material || data?.details?.wallMaterial,
    roofMaterial: payload.roof_material || data?.details?.roofMaterial,
    waterSource:  payload.water_source  || data?.details?.waterSource,

    numberOfFamilies: 
      payload.num_families_reported || 
      payload.number_of_families || 
      data?.details?.numberOfFamilies || 
      1, // Fallback kung wala talaga
  };
}, [data]);
  // ── Approve — pass indigency + housing survey data upstream ─────────────────
  const handleApproveClick = () => {
    if (onApprove) {
      onApprove(isHead ? isIndigent : 0, {
        tenureStatus: combinedDetails.tenureStatus,
        wallMaterial: combinedDetails.wallMaterial,
        roofMaterial: combinedDetails.roofMaterial,
        waterSource:  combinedDetails.waterSource,
        numberOfFamilies: combinedDetails.numberOfFamilies,
      });
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12">
      <DetailHeader {...props} t={t} onApprove={handleApproveClick} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <IdentitySection
            details={combinedDetails}
            onZoom={onZoom}
            t={t}
            currentTheme={currentTheme}
          />
          <ResidencySection details={combinedDetails} t={t} />

          {/* FIX: isHead is now passed explicitly so EconomicSection doesn't re-derive it */}
          <EconomicSection
            details={combinedDetails}
            t={t}
            isIndigent={isIndigent}
            setIsIndigent={setIsIndigent}
            isNewHousehold={isNewHousehold}
            isHead={isHead}
          />
        </div>

        <Profile
          data={data}
          details={combinedDetails}
          t={t}
          isIndigent={isIndigent}
          isHead={isHead}
        />
      </div>
    </div>
  );
};

export default VerificationDetailView;
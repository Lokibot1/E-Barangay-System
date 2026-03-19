import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import DetailHeader from '../details/DetailHeader';
import IdentitySection from '../details/IdentitySection';
import ResidencySection from '../details/ResidencySection';
import EconomicSection from '../details/EconomicSection';
import Profile from '../details/Profile';
import ProgressSection from '../details/ProgressSection'; 

const VerificationDetailView = (props) => {
  const { data, onZoom, t, onApprove, onReject, currentTheme } = props;

  const [isIndigent, setIsIndigent] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');

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

    household: household, 
    

    tenureStatus: payload.tenure_status || household.tenure_status || data?.details?.tenureStatus,
    wallMaterial: payload.wall_material || household.wall_material || data?.details?.wallMaterial,
    roofMaterial: payload.roof_material || household.roof_material || data?.details?.roofMaterial,
    waterSource:  payload.water_source  || household.water_source  || data?.details?.waterSource,
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
        hour: '2-digit', minute: '2-digit', hour12: true
      }).format(date);
    } catch (e) { return dateString; }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-20">
      <DetailHeader 
        {...props} t={t} 
        onApprove={() => onApprove(isHead ? isIndigent : 0, combinedDetails)} 
        onRejectClick={() => setShowRejectModal(true)} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
        <div className="lg:col-span-2 space-y-6">
          <IdentitySection details={combinedDetails} onZoom={onZoom} t={t} currentTheme={currentTheme} />
          <ResidencySection details={combinedDetails} t={t} />
          <EconomicSection details={combinedDetails} t={t} isIndigent={isIndigent} setIsIndigent={setIsIndigent} isNewHousehold={isNewHousehold} isHead={isHead} />
        </div>

        {/* SIDEBAR CONTAINER */}
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

      {showRejectModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-white">Reject Application</h2>
            <div className="space-y-4">
              <select
                className="w-full rounded-xl border p-3.5 text-sm dark:bg-slate-800"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="Incomplete Documents">Incomplete Documents</option>
                <option value="Invalid Address">Invalid Address</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                className="h-28 w-full resize-none rounded-2xl border p-4 text-sm dark:bg-slate-800"
                placeholder="Remarks..."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
              />
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 text-slate-500">Cancel</button>
              <button
                onClick={() => { onReject(rejectReason, rejectRemarks); setShowRejectModal(false); }}
                disabled={!rejectReason}
                className="flex-1 rounded-xl bg-red-600 py-3 text-white disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default VerificationDetailView;

/**
 * Verification.jsx
 * CHANGED: Replaced the inline spinner block with loading props passed to
 *   PendingVerificationTable and VerificationStats — skeleton is now rendered
 *   inside those components. The ternary `loading ? spinner : table+pagination`
 *   is replaced by always rendering both (table handles its own skeleton).
 * All original logic preserved.
 */
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, MapPin, XCircle } from 'lucide-react';

import { useVerification }        from '../../hooks/sub-system-1/useVerification';
import { useVerificationFilters } from '../../hooks/sub-system-1/useVerificationFilters';
import { useSound }               from '../../hooks/shared/useSound';
import themeTokens                from '../../Themetokens';

import VerificationStats         from '../../components/sub-system-1/verification/verificationstats';
import PendingVerificationTable  from '../../components/sub-system-1/verification/VerificationTable';
import VerificationFilters       from '../../components/sub-system-1/verification/VerificationFilters';
import VerificationSuccessModal  from '../../components/sub-system-1/verification/modals/VerificationSuccessModal';
import VerificationDetailView    from '../../components/sub-system-1/verification/details/VerificationDetailView';
import Pagination                from '../../components/sub-system-1/common/pagination';
import ConfirmActionModal        from '../../components/sub-system-1/verification/modals/ConfirmActionModal';
import VerificationTabs          from '../../components/sub-system-1/verification/VerificationTabs';
import ImageZoomOverlay          from '../../components/sub-system-1/common/ImageZoomOverlay';
import MinimizedSuccessCard      from '../../components/sub-system-1/verification/MinimizedSuccessCard';
import ScreenLoader              from '../../components/shared/ScreenLoader';

const Verification = () => {
  const { tr } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'modern'
  );
  const t      = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === 'dark';

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const { submissions, loading, error, updateStatus, refresh } = useVerification();
  const { playFeedback } = useSound();
  const {
    searchTerm, setSearchTerm, activeTab, setActiveTab,
    currentPage, setCurrentPage, currentData, totalPages, totalItems,
  } = useVerificationFilters(submissions);

  const [view,               setView]               = useState('list');
  const [selectedRes,        setSelectedRes]        = useState(null);
  const [zoomedImg,          setZoomedImg]          = useState(null);
  const [showSuccess,        setShowSuccess]        = useState(false);
  const [accountDetails,     setAccountDetails]     = useState(null);
  const [isMinimized,        setIsMinimized]        = useState(false);
  const [pendingAction,      setPendingAction]      = useState(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  useEffect(() => {
    const handleRemoteRefresh = (event) => {
      setView('list');
      setSelectedRes(null);
      setActiveTab(event.detail?.switchToTab || 'Pending');
      refresh();
    };
    window.addEventListener('refreshVerificationData', handleRemoteRefresh);
    return () => window.removeEventListener('refreshVerificationData', handleRemoteRefresh);
  }, [refresh, setActiveTab]);

  const tabs = [
    { id: 'Pending',          label: 'New Requests', icon: Clock   },
    { id: 'For Verification', label: 'For Visit',    icon: MapPin  },
    { id: 'Rejected',         label: 'Rejected',     icon: XCircle },
  ];

  const handleAction = (id, status, isIndigent = 0, additionalData = {}) => {
    if (isActionSubmitting) return;
    const actionText =
      status === 'Rejected'         ? 'REJECT'         :
      status === 'For Verification' ? 'SET FOR VISIT'  : 'APPROVE';
    setPendingAction({ id, status, actionText, isIndigent, additionalData });
  };

  const confirmPendingAction = async () => {
    if (!pendingAction || isActionSubmitting) return;
    const { id, status, isIndigent, additionalData } = pendingAction;
    setIsActionSubmitting(true);
    try {
      const result = await updateStatus(id, status, isIndigent, additionalData);
      if (result.success) {
        setPendingAction(null);
        if (status === 'Verified' || status === 'Approved') {
          playFeedback('success');
          setAccountDetails({ name: selectedRes?.name, ...result.residentData });
          setShowSuccess(true);
          setIsMinimized(false);
        } else {
          setView('list');
          setSelectedRes(null);
          setActiveTab(status);
        }
      } else {
        playFeedback('error');
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      playFeedback('error');
      alert(`Error: ${error?.message || 'Failed to update status.'}`);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleModalMinimize = () => { setShowSuccess(false); setIsMinimized(true); };
  const handleModalClose    = () => {
    setShowSuccess(false);
    setIsMinimized(false);
    setAccountDetails(null);
    setView('list');
    setSelectedRes(null);
    setActiveTab('Pending');
  };

  return (
    <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>
      <ScreenLoader
        show={isActionSubmitting}
        title="Processing Request"
        description="Updating the verification status. Please wait."
        zIndexClass="z-[10020]"
      />
      <ImageZoomOverlay
        isOpen={!!zoomedImg}
        imgSrc={zoomedImg}
        onClose={() => setZoomedImg(null)}
      />
      <VerificationSuccessModal
        isOpen={showSuccess && !isMinimized}
        onClose={handleModalClose}
        onMinimize={handleModalMinimize}
        data={accountDetails}
        t={t}
        currentTheme={currentTheme}
      />
      <ConfirmActionModal
        pendingAction={pendingAction}
        onClose={() => { if (!isActionSubmitting) setPendingAction(null); }}
        onConfirm={confirmPendingAction}
        isSubmitting={isActionSubmitting}
        t={t}
      />
      {isMinimized && accountDetails && (
        <MinimizedSuccessCard
          data={accountDetails}
          onExpand={() => { setShowSuccess(true); setIsMinimized(false); }}
          onClose={() => { setIsMinimized(false); setAccountDetails(null); }}
        />
      )}

      <div className="mx-auto w-full max-w-[1600px]">
        {view === 'list' ? (
          <div className="animate-in fade-in duration-500 space-y-6 pt-4 sm:pt-5">
            <section className="max-w-3xl space-y-3 text-left">
              <div className="space-y-2 text-left">
                <h1 className={`text-[2.25rem] sm:text-[2.1rem] font-bold tracking-tight text-left ${t.cardText} font-spartan`}>
                  {tr.sub1.verification}
                </h1>
                <p className={`max-w-2xl text-[13px] leading-6 sm:text-[13px] text-left ${t.subtleText} font-kumbh`}>
                  {tr.sub1.verificationDesc}
                </p>
              </div>
            </section>

            {/* Stats — shows skeleton while loading */}
            <VerificationStats
              submissions={submissions}
              loading={loading}
              t={t}
              currentTheme={currentTheme}
            />

            <div className={`${t.cardBg} border ${t.cardBorder} overflow-hidden rounded-[30px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex flex-col`}>
              <div className={`border-b px-5 py-5 sm:px-6 ${t.cardBorder} ${isDark ? 'bg-slate-950/70' : 'bg-white/70'}`}>
                <div className="flex">
                  <VerificationTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    t={t}
                    currentTheme={currentTheme}
                  />
                </div>
              </div>

              <VerificationFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeTab={activeTab}
                totalItems={totalItems}
                t={t}
                currentTheme={currentTheme}
              />

              {/* Table — shows skeleton rows while loading, no more inline spinner */}
              <PendingVerificationTable
                data={currentData}
                loading={loading}
                onReview={(res) => { setSelectedRes(res); setView('detail'); }}
                t={t}
                currentTheme={currentTheme}
              />

              {/* Pagination only shown when not loading */}
              {!loading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalItems}
                  itemsPerPage={10}
                  t={t}
                  currentTheme={currentTheme}
                />
              )}
            </div>
          </div>
        ) : (
          <VerificationDetailView
            data={selectedRes}
            setView={setView}
            onVisitBgy={() => handleAction(selectedRes.id, 'For Verification')}
            onApprove={(indigentStatus, extraData) =>
              handleAction(selectedRes.id, 'Verified', indigentStatus, extraData)
            }
            onReject={(reason, remarks) =>
              handleAction(selectedRes.id, 'Rejected', 0, {
                rejection_reason:  reason,
                rejection_remarks: remarks,
              })
            }
            onZoom={setZoomedImg}
            isActionSubmitting={isActionSubmitting}
            t={t}
            currentTheme={currentTheme}
          />
        )}
      </div>
    </div>
  );
};

export default Verification;
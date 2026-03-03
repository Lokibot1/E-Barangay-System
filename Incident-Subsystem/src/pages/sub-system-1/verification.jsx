import React, { useState, useEffect } from 'react';
import { Clock, MapPin, XCircle } from 'lucide-react'; 

// Hooks
import { useVerification } from '../../hooks/sub-system-1/useVerification';
import { useVerificationFilters } from '../../hooks/sub-system-1/useVerificationFilters';
import { useSound } from '../../hooks/shared/useSound';
import themeTokens from '../../Themetokens'; 

// Components
import VerificationStats from '../../components/sub-system-1/verification/verificationstats';
import PendingVerificationTable from '../../components/sub-system-1/verification/VerificationTable';
import VerificationFilters from '../../components/sub-system-1/verification/VerificationFilters';
import VerificationSuccessModal from '../../components/sub-system-1/verification/modals/VerificationSuccessModal';
import VerificationDetailView from '../../components/sub-system-1/verification/details/VerificationDetailView';
import Pagination from '../../components/sub-system-1/common/pagination';
import ConfirmActionModal from '../../components/sub-system-1/verification/modals/ConfirmActionModal';
import VerificationTabs from '../../components/sub-system-1/verification/VerificationTabs';
import ImageZoomOverlay from '../../components/sub-system-1/common/ImageZoomOverlay';
import MinimizedSuccessCard from '../../components/sub-system-1/verification/MinimizedSuccessCard';

const Verification = () => {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'blue');
  const t = themeTokens[currentTheme] || themeTokens.blue; 

  const { submissions, loading, error, updateStatus } = useVerification();
  const { playFeedback } = useSound();
  const { 
    searchTerm, setSearchTerm, activeTab, setActiveTab, 
    currentPage, setCurrentPage, currentData, totalPages, totalItems 
  } = useVerificationFilters(submissions);

  const [view, setView] = useState('list');
  const [selectedRes, setSelectedRes] = useState(null);
  const [zoomedImg, setZoomedImg] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const tabs = [
    { id: 'Pending', label: 'New Requests', icon: Clock },
    { id: 'For Verification', label: 'For Visit', icon: MapPin },
    { id: 'Rejected', label: 'Rejected', icon: XCircle },
  ];

  const handleAction = (id, status) => {
    const actionText = status === 'Rejected' ? 'REJECT' : status === 'For Verification' ? 'SET FOR VISIT' : 'APPROVE';
    setPendingAction({ id, status, actionText });
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;
    const { id, status } = pendingAction;
    setPendingAction(null);
    const result = await updateStatus(id, status);

    if (result.success) {
      if (status === 'Verified' || status === 'Approved') {
        playFeedback('success'); 
        setAccountDetails({ name: selectedRes?.name, ...result.residentData });
        setShowSuccess(true);
        setIsMinimized(false);
      } else {
        setView('list'); setSelectedRes(null); setActiveTab(status);
      }
    } else {
      playFeedback('error'); alert(`Error: ${result.message}`);
    }
  };

  return (
    <div className={`font-sans min-h-screen py-4 pb-20 px-4 md:px-0 relative ${t.pageBg}`}>
      
      <ImageZoomOverlay isOpen={!!zoomedImg} imgSrc={zoomedImg} onClose={() => setZoomedImg(null)} />

      <VerificationSuccessModal
        isOpen={showSuccess}
        onClose={() => { setShowSuccess(false); setIsMinimized(true); setView('list'); setSelectedRes(null); setActiveTab('Pending'); }}
        data={accountDetails} t={t}
      />

      <ConfirmActionModal pendingAction={pendingAction} onClose={() => setPendingAction(null)} onConfirm={confirmPendingAction} t={t} />

      {isMinimized && accountDetails && (
        <MinimizedSuccessCard data={accountDetails} onExpand={() => { setShowSuccess(true); setIsMinimized(false); }} onClose={() => { setIsMinimized(false); setAccountDetails(null); }} />
      )}

      {view === 'list' ? (
        <div className="animate-in fade-in duration-500 space-y-5">
          <h1 className={`text-2xl sm:text-3xl font-bold ${t.cardText} font-spartan uppercase`}>Identity Verification</h1>
          
          <VerificationStats submissions={submissions} t={t} />
          <VerificationTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className={`bg-white dark:bg-slate-900 border ${t.cardBorder} rounded-xl overflow-hidden shadow-sm flex flex-col`}>
            <VerificationFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} t={t} />
            
            {loading ? <div className="p-10 text-center italic text-slate-400">Loading...</div> : (
              <>
                <PendingVerificationTable data={currentData} onReview={(res) => { setSelectedRes(res); setView('detail'); }} t={t} />
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalItems} itemsPerPage={10} t={t} />
              </>
            )}
          </div>
        </div>
      ) : (
        <VerificationDetailView data={selectedRes} setView={setView} onVisitBgy={() => handleAction(selectedRes.id, 'For Verification')} onApprove={() => handleAction(selectedRes.id, 'Verified')} onReject={() => handleAction(selectedRes.id, 'Rejected')} onZoom={setZoomedImg} t={t} />
      )}
    </div>
  );
};

export default Verification;
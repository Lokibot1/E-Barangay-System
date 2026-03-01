import React, { useState, useEffect } from 'react';
import { Clock, MapPin, XCircle, Key, X } from 'lucide-react'; 
import { useVerification } from '../../hooks/shared/useVerification';
import VerificationStats from '../../components/sub-system-1/verification/verificationstats';
import PendingVerificationTable from '../../components/sub-system-1/verification/VerificationTable';
import VerificationFilters from '../../components/sub-system-1/verification/VerificationFilters';
import VerificationSuccessModal from '../../components/sub-system-1/verification/VerificationSuccessModal';
import DetailView from '../../components/sub-system-1/verification/VerificationDetailView';
import Pagination from '../../components/sub-system-1/common/pagination';
import { useSound } from '../../hooks/shared/useSound';
import themeTokens from '../../Themetokens';  

const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-white uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20}/>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Verification = () => {

  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'blue');
  
  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.blue; 

  const { submissions, loading, error, updateStatus, refreshData } = useVerification(); 

useEffect(() => {
  const handleRefresh = () => {
    console.log("🔔 Notification received: Refreshing verification list...");
    
    if (refreshData) {
      refreshData();
    } else {
     
      window.location.reload(); 
    }
  };


  window.addEventListener('refreshVerificationData', handleRefresh);

  return () => {
    window.removeEventListener('refreshVerificationData', handleRefresh);
  };
}, [refreshData]); 

  const [view, setView] = useState('list');
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedRes, setSelectedRes] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomedImg, setZoomedImg] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const { playFeedback } = useSound();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  // Reset page logic
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm]);

  const filteredSubmissions = (submissions || []).filter(s => {
    const matchesTab = s.status === activeTab;
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalItems = filteredSubmissions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = filteredSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getActionConfig = (status) => {
    if (status === 'Verified' || status === 'Approved') {
      return { actionText: 'APPROVE', buttonText: 'Approve', buttonClass: 'bg-emerald-600 hover:bg-emerald-700' };
    }
    if (status === 'For Verification') {
      return { actionText: 'SET FOR VISIT', buttonText: 'Set for Visit', buttonClass: 'bg-amber-500 hover:bg-amber-600' };
    }
    return { actionText: 'REJECT', buttonText: 'Reject', buttonClass: 'bg-red-600 hover:bg-red-700' };
  };

  const handleAction = (id, status) => {
    const { actionText } = getActionConfig(status);
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
        setAccountDetails({
          name: selectedRes?.name,
          id: result.residentData?.id,
          user: result.residentData?.user,
          pass: result.residentData?.pass,
          token: result.residentData?.token,
        });
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
  };

  const tabs = [
    { id: 'Pending', label: 'New Requests', icon: Clock },
    { id: 'For Verification', label: 'For Visit', icon: MapPin },
    { id: 'Rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div className={`font-sans min-h-screen py-4 pb-20 px-4 md:px-0 relative ${t.pageBg}`}>
      {/* Zoomed Image Overlay */}
      {zoomedImg && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomedImg(null)}>
          <img src={zoomedImg} className="max-w-full max-h-full object-contain" alt="Zoomed" />
        </div>
      )}

      {/* Modals */}
      <VerificationSuccessModal
        isOpen={showSuccess}
        onClose={() => { 
            setShowSuccess(false); 
            setIsMinimized(true); 
            setView('list'); 
            setSelectedRes(null); 
            setActiveTab('Pending'); 
        }}
        data={accountDetails}
        t={t}
      />

      <ModalWrapper
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        title="Confirm Action"
      >
        <div className="space-y-5">
          <p className={`text-sm ${t.subtleText}`}>
            Are you sure you want to <strong>{pendingAction?.actionText}</strong> this submission?
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setPendingAction(null)} className="px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              Cancel
            </button>
            <button
              onClick={confirmPendingAction}
              className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${pendingAction ? getActionConfig(pendingAction.status).buttonClass : 'bg-emerald-600'}`}
            >
              {pendingAction ? getActionConfig(pendingAction.status).buttonText : 'Confirm'}
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* Minimized Success View */}
      {isMinimized && accountDetails && (
        <div className="fixed bottom-10 right-10 z-[100] flex items-center gap-2">
            <button 
                onClick={() => { setShowSuccess(true); setIsMinimized(false); }}
                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl transition-all border-2 border-white"
            >
                <Key size={18} />
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase opacity-80">View Last Approved</p>
                    <p className="text-xs font-bold">{accountDetails.name}</p>
                </div>
            </button>
            <button onClick={() => { setIsMinimized(false); setAccountDetails(null); }} className="p-2 bg-slate-800 text-white rounded-full hover:bg-red-500 shadow-lg">
                <XCircle size={20} />
            </button>
        </div>
      )}

      {view === 'list' ? (
        <div className="animate-in fade-in duration-500 space-y-5">
          <header>
              <h1
            className={`text-2xl sm:text-3xl font-bold ${t.cardText} font-spartan uppercase`}
          >
           Identity Verification
          </h1>
          </header>

          <VerificationStats submissions={submissions} t={t} />
          
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap
                  ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <div className={`bg-white dark:bg-slate-900 border ${t.cardBorder} rounded-xl overflow-hidden shadow-sm flex flex-col`}>
            <VerificationFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} t={t} />
            
            {error && <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            
            {loading ? (
              <div className="p-10 text-center italic text-slate-400">Loading...</div>
            ) : (
              <>
                <PendingVerificationTable 
                  data={currentData} 
                  onReview={(res) => { setSelectedRes(res); setView('detail'); }} 
                  t={t}
                />
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  t={t}
                />
              </>
            )}
          </div>
        </div>
      ) : (
        <DetailView
          data={selectedRes}
          setView={setView}
          onVisitBgy={() => handleAction(selectedRes.id, 'For Verification')}
          onApprove={() => handleAction(selectedRes.id, 'Verified')}
          onReject={() => handleAction(selectedRes.id, 'Rejected')}
          onZoom={(img) => setZoomedImg(img)}
          t={t}
        />
      )}
    </div>
  );
};

export default Verification;
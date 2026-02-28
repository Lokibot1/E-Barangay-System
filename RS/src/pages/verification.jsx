import React, { useState, useEffect } from 'react';
import { Clock, MapPin, XCircle, Key, X } from 'lucide-react';
import { useVerification } from '../hooks/useVerification';
import VerificationStats from '../components/verification/verificationstats';
import PendingVerificationTable from '../components/verification/VerificationTable';
import VerificationFilters from '../components/verification/VerificationFilters';
import VerificationSuccessModal from '../components/verification/VerificationSuccessModal';
import DetailView from '../components/verification/VerificationDetailView';
import ModalWrapper from '../components/common/ModalWrapper';
import Pagination from '@/components/common/pagination';
import { useSound } from '@/hooks/useSound';

const Verification = () => {
  const { submissions, loading, error, updateStatus } = useVerification();
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

  // ✅ PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Change this as needed

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  // ✅ FILTERING LOGIC
  const filteredSubmissions = submissions.filter(s => {
    const matchesTab = s.status === activeTab;
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // ✅ PAGINATION LOGIC (Sliced Data)
  const totalItems = filteredSubmissions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const getActionConfig = (status) => {
    if (status === 'Verified') {
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
      if (status === 'Verified') {
     
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
    <div className="font-sans min-h-screen pb-20 px-4 md:px-0 relative">
      {zoomedImg && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomedImg(null)}>
          <img src={zoomedImg} className="max-w-full max-h-full object-contain" alt="Zoomed" />
        </div>
      )}

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
      />

      <ModalWrapper
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        title="Confirm Submission Action"
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Are you sure you want to {pendingAction?.actionText} this submission?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPendingAction(null)}
              className="px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmPendingAction}
              className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${pendingAction ? getActionConfig(pendingAction.status).buttonClass : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {pendingAction ? getActionConfig(pendingAction.status).buttonText : 'Confirm'}
            </button>
          </div>
        </div>
      </ModalWrapper>

      {isMinimized && accountDetails && (
        <div className="fixed bottom-10 right-10 z-[100] flex items-center gap-2">
            <button 
                onClick={() => { setShowSuccess(true); setIsMinimized(false); }}
                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl transition-all border-2 border-white"
            >
                <Key size={18} />
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase opacity-80 text-white">View Last Approved</p>
                    <p className="text-xs font-bold text-white">{accountDetails.name}</p>
                </div>
            </button>
            <button 
                onClick={() => { setIsMinimized(false); setAccountDetails(null); }}
                className="p-2 bg-slate-800 text-white rounded-full hover:bg-red-500 transition-colors shadow-lg"
            >
                <XCircle size={20} />
            </button>
        </div>
      )}

      {view === 'list' ? (
        <div className="animate-in fade-in duration-500 space-y-8">
         <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">
        Identity Verification
      </h1>
          <VerificationStats submissions={submissions} />
          
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

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <VerificationFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            {error && (
              <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="p-10 text-center italic text-slate-400">Loading...</div>
            ) : (
              <>
                {/* ✅ PASSED THE SLICED DATA INSTEAD OF FILTERED DATA */}
                <PendingVerificationTable 
                  data={currentData} 
                  onReview={(res) => { setSelectedRes(res); setView('detail'); }} 
                />

                {/* ✅ ADDED YOUR REUSABLE PAGINATION HERE */}
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
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
        />
      )}
    </div>
  );
};

export default Verification;

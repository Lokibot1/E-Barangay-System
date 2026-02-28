import React, { useState, useEffect } from 'react';
import { Clock, MapPin, XCircle, Key, X } from 'lucide-react';
import { useVerification } from '../../hooks/shared/useVerification';
import VerificationStats from '../../components/sub-system-1/verification/verificationstats';
import PendingVerificationTable from '../../components/sub-system-1/verification/VerificationTable';
import VerificationFilters from '../../components/sub-system-1/verification/VerificationFilters';
import VerificationSuccessModal from '../../components/sub-system-1/verification/VerificationSuccessModal';
import DetailView from '../../components/sub-system-1/verification/VerificationDetailView';
import ModalWrapper from '../../components/sub-system-1/common/ModalWrapper';
import Pagination from '../../components/sub-system-1/common/pagination';
import { useSound } from '../../hooks/shared/useSound';

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
    const config = {
      Pending: { text: 'Review', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: '🔍', color: 'text-amber-700 dark:text-amber-400' },
      Approved: { text: 'Confirmed', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: '✓', color: 'text-emerald-700 dark:text-emerald-400' },
      Rejected: { text: 'Denied', bg: 'bg-red-100 dark:bg-red-900/30', icon: '✕', color: 'text-red-700 dark:text-red-400' },
      'On Hold': { text: 'Suspended', bg: 'bg-slate-100 dark:bg-slate-800', icon: '⏸', color: 'text-slate-700 dark:text-slate-400' }
    };
    return config[status] || config.Pending;
  };

  if (view === 'detail' && selectedRes) {
    return (
      <DetailView
        resident={selectedRes}
        onBack={() => { setView('list'); setSelectedRes(null); }}
        onApprove={() => {
          updateStatus(selectedRes.id, 'Approved');
          setShowSuccess(true);
          playFeedback('success');
          setTimeout(() => { setView('list'); setShowSuccess(false); }, 2000);
        }}
        onReject={() => {
          updateStatus(selectedRes.id, 'Rejected');
          setView('list');
          playFeedback('error');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">ID Verification</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Review Resident Documentation</p>
      </div>

      <VerificationStats submissions={submissions} />

      <VerificationFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {['Pending', 'Approved', 'Rejected', 'On Hold'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : currentData.length > 0 ? (
        <>
          <PendingVerificationTable
            submissions={currentData}
            onViewDetail={(resident) => { setSelectedRes(resident); setView('detail'); }}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div className="text-center py-20 text-slate-500">No {activeTab} submissions</div>
      )}

      {showSuccess && <VerificationSuccessModal />}
    </div>
  );
};

export default Verification;

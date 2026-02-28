import React, { useState, useEffect } from 'react';
import { useVerification } from '../../hooks/shared/useVerification';
import VerificationStats from '../../components/sub-system-1/verification/verificationstats';
import PendingVerificationTable from '../../components/sub-system-1/verification/VerificationTable';
import VerificationFilters from '../../components/sub-system-1/verification/VerificationFilters';
import VerificationSuccessModal from '../../components/sub-system-1/verification/VerificationSuccessModal';
import DetailView from '../../components/sub-system-1/verification/VerificationDetailView';
import Pagination from '../../components/sub-system-1/common/pagination';
import { useSound } from '../../hooks/shared/useSound';
import themeTokens from '../../Themetokens';

const Verification = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'blue'
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];

  const { submissions, loading, error, updateStatus } = useVerification();
  const [view, setView] = useState('list');
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedRes, setSelectedRes] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { playFeedback } = useSound();

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const filteredSubmissions = submissions.filter(s => {
    const matchesTab = s.status === activeTab;
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalItems = filteredSubmissions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  if (view === 'detail' && selectedRes) {
    return (
      <div className="p-6 sm:p-8">
        <DetailView
          data={selectedRes}
          t={t}
          setView={(v) => { setView(v); if (v === 'list') setSelectedRes(null); }}
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
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>
          ID Verification
        </h1>
        <p className={`text-xs font-kumbh ${t.subtleText} uppercase tracking-widest mt-1`}>
          Review Resident Documentation
        </p>
      </div>

      <VerificationStats submissions={submissions} t={t} />

      <VerificationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        t={t}
      />

      {/* Tabs */}
      <div className={`flex gap-2 border-b ${t.cardBorder}`}>
        {['Pending', 'Approved', 'Rejected', 'On Hold'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-kumbh font-bold border-b-2 transition-colors ${
              activeTab === tab
                ? `${t.sidebarActiveBorder} ${t.sidebarActiveText}`
                : `border-transparent ${t.subtleText}`
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`text-center py-20 font-kumbh ${t.subtleText}`}>Loading…</div>
      ) : currentData.length > 0 ? (
        <>
          <PendingVerificationTable
            data={currentData}
            onReview={(resident) => { setSelectedRes(resident); setView('detail'); }}
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
      ) : (
        <div className={`text-center py-20 font-kumbh ${t.subtleText}`}>
          No {activeTab} submissions
        </div>
      )}

      {showSuccess && <VerificationSuccessModal />}
    </div>
  );
};

export default Verification;

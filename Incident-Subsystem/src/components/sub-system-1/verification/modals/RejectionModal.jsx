import React, { useState } from 'react';

const RejectionModal = ({ isOpen, onClose, onConfirm, theme = {} }) => {
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const MAX_CHARS = 300;

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason) {
      onConfirm(reason, remarks);
      setReason('');
      setRemarks('');
    }
  };

  const t = theme;

  const reasons = [
    { value: 'Incomplete Documents', label: 'Incomplete documents' },
    { value: 'Invalid Address / Not Found', label: 'Invalid address / not found' },
    { value: 'Incorrect Information', label: 'Incorrect information provided' },
    { value: 'Failed Verification', label: 'Failed personal verification' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${t.modalBg ?? 'bg-white'} w-full max-w-md rounded-3xl shadow-2xl border ${t.cardBorder ?? 'border-slate-200'} animate-in zoom-in-95 duration-200 overflow-hidden`}>

        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-400" />

        {/* Header */}
        <div className="px-8 pt-6 pb-5 bg-gradient-to-br from-red-50 to-rose-50 border-b border-red-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <h2 className={`text-base font-semibold ${t.modalTitle ?? 'text-slate-800'}`}>Reject application</h2>
                <p className={`text-sm mt-0.5 ${t.modalSubtext ?? 'text-slate-500'}`}>This action cannot be undone.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${t.modalCloseBtnColor ?? 'text-slate-400'} ${t.modalCloseBtnHoverBg ?? 'hover:bg-slate-100'} ${t.modalCloseBtnHover ?? 'hover:text-slate-600'} transition-colors`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">

          {/* Reason dropdown */}
          <div>
            <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block ${t.labelText ?? 'text-slate-500'}`}>
              Reason <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                className={`w-full px-4 py-3 pr-10 rounded-xl border ${t.inputBorder ?? 'border-slate-200'} ${t.inputBg ?? 'bg-slate-50'} ${t.inputText ?? 'text-slate-800'} text-sm outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all cursor-pointer appearance-none`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <svg
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${t.subtleText ?? 'text-slate-400'}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Remarks textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${t.labelText ?? 'text-slate-500'}`}>
                Additional remarks{' '}
                <span className={`normal-case font-normal tracking-normal text-[11px] ${t.subtleText ?? 'text-slate-400'}`}>— optional</span>
              </label>
              <span className={`text-[11px] tabular-nums transition-colors ${remarks.length >= MAX_CHARS * 0.9 ? 'text-red-500' : t.subtleText ?? 'text-slate-400'}`}>
                {remarks.length} / {MAX_CHARS}
              </span>
            </div>
            <textarea
              className={`w-full h-28 px-4 py-3 rounded-xl border ${t.inputBorder ?? 'border-slate-200'} ${t.inputBg ?? 'bg-slate-50'} ${t.inputText ?? 'text-slate-800'} ${t.inputPlaceholder ?? 'placeholder-slate-400'} text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none resize-none transition-all`}
              placeholder="Provide more context or supporting details..."
              value={remarks}
              maxLength={MAX_CHARS}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className={`px-8 py-5 ${t.footerBg ?? 'bg-slate-50'} border-t ${t.footerBorder ?? 'border-slate-200'} flex gap-3`}>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border ${t.cardBorder ?? 'border-slate-200'} ${t.footerPrevActiveBg ?? 'bg-white'} ${t.footerPrevActiveText ?? 'text-slate-700'} ${t.footerPrevActiveHover ?? 'hover:bg-slate-100'} transition-colors`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!reason}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-sm ${
              reason
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                : 'bg-red-300 cursor-not-allowed opacity-60'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            Confirm rejection
          </button>
        </div>

      </div>
    </div>
  );
};

export default RejectionModal;
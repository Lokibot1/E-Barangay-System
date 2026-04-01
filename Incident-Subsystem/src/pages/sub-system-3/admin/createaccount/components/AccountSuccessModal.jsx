import React from 'react';
import { CheckCircle } from 'lucide-react';

const AccountSuccessModal = ({ successData, isDark, t, onClose }) => {
  if (!successData) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl">
      <div className={`w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 text-center border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
          <CheckCircle size={28} className="text-white" />
        </div>
        <h2 className={`text-xl font-semibold font-spartan ${t.cardText}`}>Account Created</h2>
        <p className={`text-xs font-bold font-kumbh mt-1 mb-6 ${t.subtleText}`}>Successfully provisioned</p>
        <div className={`rounded-2xl p-4 text-left space-y-2 mb-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          {[['Name', successData.name], ['Username', `@${successData.username}`], ['Email', successData.email], ['Role', successData.role]].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center">
              <span className={`text-[9px] font-semibold font-kumbh ${t.subtleText}`}>{label}</span>
              <span className={`text-xs font-bold font-kumbh ${t.cardText}`}>{value}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3.5 rounded-2xl text-xs font-semibold font-kumbh text-white active:scale-[0.98] transition-all shadow-lg bg-gradient-to-r ${t.primaryGrad} hover:opacity-90`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default AccountSuccessModal;

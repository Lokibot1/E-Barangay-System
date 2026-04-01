import React from 'react';
import { Shield, UserPlus } from 'lucide-react';

const AccountHeader = ({ t, onNewAccount }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Shield size={18} className={t.subtleText} />
        <span className={`text-[10px] font-semibold font-kumbh ${t.subtleText}`}>System Access</span>
      </div>
      <h1 className={`text-3xl font-semibold font-spartan ${t.cardText}`}>Account Management</h1>
    </div>
    <button
      type="button"
      onClick={onNewAccount}
      className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white text-xs font-semibold font-kumbh shadow-lg active:scale-95 transition-all bg-gradient-to-r ${t.primaryGrad} hover:opacity-90`}
    >
      <UserPlus size={15} /> New Account
    </button>
  </div>
);

export default AccountHeader;


import React from 'react';
import ModalWrapper from '../common/ModalWrapper';
import HouseholdHero from './hhmc/HouseholdHero';
import HousingSurvey from './hhmc/HousingSurvey';
import FamilyTable from './hhmc/FamilyTable';

const HouseholdModal = ({ isOpen, onClose, data, t }) => {
  if (!data) return null;

  const hNo = data.houseNumber || data.details?.houseNumber || '';
  const street = data.street || data.details?.street || '';
  const purok = data.purok || data.details?.purok || 'N/A';
  
  const baseAddress = (hNo || street) 
    ? `${hNo} ${street}`.trim() 
    : (data.address || 'NO ADDRESS PROVIDED');

  const fullAddress = `${baseAddress}, BGY. GULOD, NOVALICHES, QUEZON CITY`.replace(/\s+/g, ' ').trim();

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`HOUSEHOLD PROFILE: ${data.household_id || 'PENDING ID'}`}
      maxWidth="max-w-3xl"
      t={t}
    >
      <div className="space-y-6">
        {/* 1. Hero Sections (Head & Size) */}
        <HouseholdHero data={data} t={t} />

        {/* 2. Housing Survey (Materials & Classification) */}
        <HousingSurvey data={data} t={t} />

        {/* 3. FIXED LOCATION BLOCK */}
        <div className={`${t.inlineBg} rounded-2xl p-4 border ${t.cardBorder}`}>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Registered Address</p>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
            <p className={`text-sm font-bold ${t.cardText} uppercase font-spartan max-w-[80%]`}>
              {fullAddress}
            </p>
            <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
              Purok {purok}
            </span>
          </div>
        </div>

        {/* 4. Family Composition Table */}
        <FamilyTable 
          members={data.memberList} 
          establishedDate={data.established_date} 
          t={t} 
        />

        {/* Footer */}
        <div className="pt-2 flex justify-end items-center gap-4">
          <p className="text-[9px] font-bold text-slate-400 italic font-kumbh">
            Data is subject to barangay privacy policy
          </p>
          <button
            onClick={onClose}
            className={`px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg font-spartan`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default HouseholdModal;
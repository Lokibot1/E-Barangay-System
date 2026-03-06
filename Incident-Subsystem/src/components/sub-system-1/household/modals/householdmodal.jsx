import React from 'react';
import ModalWrapper from '../../common/ModalWrapper';
import HouseholdHero from '../hhmc/HouseholdHero';
import HousingSurvey from '../hhmc/HousingSurvey';
import FamilyTable from '../hhmc/FamilyTable';

const HouseholdModal = ({ isOpen, onClose, onEdit, data, t }) => {
  if (!data) return null;

  const hNo = data.house_number || data.details?.house_number || '';
  const street = data.street_name || data.details?.street_name || '';
  
  const rawPurok = data.purok || data.details?.purok || 'N/A';
  const cleanPurok = rawPurok.toString().toLowerCase().includes('purok') 
    ? rawPurok 
    : `Purok ${rawPurok}`;
  
  const baseAddress = (hNo || street) 
    ? `${hNo} ${street}`.trim() 
    : (data.address || 'NO ADDRESS PROVIDED');

  const fullAddress = `${baseAddress}, BGY. GULOD, NOVALICHES, QUEZON CITY`.replace(/\s+/g, ' ').trim();

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`HOUSEHOLD PROFILE: ${data.id || 'PENDING ID'}`}
      maxWidth="max-w-3xl"
      t={t}
    >
      {/* FIXED CONTAINER: */}
      <div className="flex flex-col max-h-[80vh]">
        
        {/* SCROLLABLE BODY: */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-300">
          
          {/* 1. Hero Sections (Head & Size) */}
          <HouseholdHero data={data} t={t} />

          {/* 2. Housing Survey (Materials & Classification) */}
          <HousingSurvey data={data} t={t} />

          {/* 3. LOCATION BLOCK */}
          <div className={`${t.inlineBg} rounded-2xl p-4 border ${t.cardBorder}`}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Registered Address</p>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
              <p className={`text-sm font-bold ${t.cardText} uppercase font-spartan max-w-[80%]`}>
                {fullAddress}
              </p>
              <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                {cleanPurok}
              </span>
            </div>
          </div>

          {/* 4. Family Composition Table */}
          <FamilyTable 
            members={data.memberList} 
            t={t} 
          />
        </div>

        {/* STICKY FOOTER: */}
        <div className={`pt-4 flex flex-col md:flex-row justify-end items-center gap-4 border-t ${t.cardBorder} ${t.cardBg} sticky bottom-0 z-10 mt-2`}>
          <p className="hidden md:block text-[9px] font-bold text-slate-400 italic font-kumbh mr-auto">
            Data is subject to barangay privacy policy
          </p>
          
          <div className="flex gap-3 w-full md:w-auto pb-2">
            {/* EDIT BUTTON */}
            <button
              onClick={() => {
                onClose(); 
                onEdit(data); 
              }}
              className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-700 hover:shadow-emerald-500/20 active:scale-95 transition-all shadow-lg font-spartan"
            >
              Edit Profile
            </button>

            {/* DISMISS BUTTON */}
            <button
              onClick={onClose}
              className={`flex-1 md:flex-none px-8 py-3 bg-slate-200 dark:bg-slate-800 ${t.cardText} text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all font-spartan`}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default HouseholdModal;
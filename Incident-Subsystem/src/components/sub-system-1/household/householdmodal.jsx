import React from 'react';
import ModalWrapper from '../common/ModalWrapper';
import HouseholdHero from './hhmc/HouseholdHero';
import HousingSurvey from './hhmc/HousingSurvey';
import FamilyTable from './hhmc/FamilyTable';

const badgeAccentMap = {
  modern: 'bg-blue-50 text-blue-600 border-blue-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  dark: 'bg-slate-700 text-slate-200 border-slate-600',
};

const HouseholdModal = ({ isOpen, onClose, data, t, currentTheme = 'modern' }) => {
  if (!data) return null;
  const accentBadge = badgeAccentMap[currentTheme] || badgeAccentMap.modern;

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
      title={`Household profile: ${data.household_id || 'Pending ID'}`}
      maxWidth="max-w-3xl"
      t={t}
    >
      <div className="space-y-6">
        {/* 1. Hero Sections (Head & Size) */}
        <HouseholdHero data={data} t={t} currentTheme={currentTheme} />

        {/* 2. Housing Survey (Materials & Classification) */}
        <HousingSurvey data={data} t={t} currentTheme={currentTheme} />

        {/* 3. FIXED LOCATION BLOCK */}
        <div className={`${t.inlineBg} rounded-2xl p-4 border ${t.cardBorder}`}>
          <p className="text-xs font-medium text-slate-400 mb-1">Registered address</p>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
            <p className={`text-sm font-medium ${t.cardText} font-kumbh max-w-[80%] leading-relaxed`}>
              {fullAddress}
            </p>
            <span className={`text-xs font-semibold px-3 py-1 rounded-lg border font-kumbh ${accentBadge}`}>
              Purok {purok}
            </span>
          </div>
        </div>

        {/* 4. Family Composition Table */}
        <FamilyTable 
          members={data.memberList} 
          establishedDate={data.established_date} 
          t={t}
          currentTheme={currentTheme}
        />

        {/* Footer */}
        <div className="pt-2 flex justify-end items-center gap-4">
          <p className="text-[10px] font-medium text-slate-400 italic font-kumbh">
            Data is subject to barangay privacy policy
          </p>
          <button
            onClick={onClose}
            className={`px-8 py-3 ${t.primarySolid} ${t.primaryHover} text-white text-sm font-semibold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg font-kumbh`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default HouseholdModal;

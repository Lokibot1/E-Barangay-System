import React from 'react';
import { User, MapPin, Phone } from 'lucide-react';
import { InfoField } from '../../common/InfoField';

const Profile = ({ data, details, t }) => (
  <div className={`${t?.cardBg ?? 'bg-slate-900'} p-8 rounded-3xl border-t-8 border-emerald-500 shadow-xl lg:sticky lg:top-8`}>
    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-8 flex items-center gap-2">
      <User size={14} /> Personal Profile
    </p>
    <div className="space-y-5">
      <InfoField label="Full Legal Name" val={data?.name} t={t} />
      <div className="grid grid-cols-2 gap-4">
        <InfoField label="Age" val={details?.age} t={t} />
        <InfoField label="Gender" val={details?.sex} t={t} />
      </div>
      <div className="grid grid-cols-2 gap-4">
         <InfoField label="Marital Status" val={details?.maritalStatus} t={t} />
         <InfoField label="Nationality" val={details?.nationality} t={t} />
      </div>
       <div className="grid grid-cols-2 gap-4">
         <InfoField label="Birth Registration" val={details?.birthRegistration} t={t} />
         <InfoField label="Sector" val={details?.sector} t={t} />
      </div>
      <div className={`h-px ${t?.cardBorder ? 'border-t ' + t.cardBorder : 'bg-slate-800'} my-4`} />

      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
         <MapPin size={14} /> Location Data
      </p>
      <InfoField label="Purok" val={details?.purok} t={t} />
      <InfoField label="Street" val={details?.street} t={t} />
      <InfoField label="House Number" val={details?.houseNumber} t={t} />
      <InfoField label="Position in Family" val={details?.householdPosition} t={t} />

      <div className={`h-px ${t?.cardBorder ? 'border-t ' + t.cardBorder : 'bg-slate-800'} my-4`} />

      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
         <Phone size={14} /> Contact Details
      </p>
      <InfoField label="Mobile Number" val={details?.contact} t={t} />
    </div>
  </div>
);

export default Profile;

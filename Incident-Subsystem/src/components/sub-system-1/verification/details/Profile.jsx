import React from 'react';
import { User, MapPin, Phone } from 'lucide-react';
import { InfoField } from '../../common/InfoField';

const Profile = ({ data, details, t }) => (
  <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-3xl border-t-8 border-emerald-500 shadow-2xl lg:sticky lg:top-8 text-white">
    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-8 flex items-center gap-2">
      <User size={16} /> Personal Profile
    </p>
    
    <div className="space-y-6">
      <InfoField label="Full Legal Name" val={data?.name} t={{cardText: 'text-white'}} />
      
      <div className="grid grid-cols-2 gap-6">
        <InfoField label="Age" val={details?.age} t={{cardText: 'text-slate-200'}} />
        <InfoField label="Gender" val={details?.sex} t={{cardText: 'text-slate-200'}} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <InfoField label="Marital Status" val={details?.maritalStatus} t={{cardText: 'text-slate-200'}} />
        <InfoField label="Nationality" val={details?.nationality} t={{cardText: 'text-slate-200'}} />
      </div>

      <div className="h-px bg-slate-800 my-2" />

       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
         <MapPin size={14} /> Location Data
      </p>
      <InfoField label="House Number" val={details?.houseNumber} />
      <InfoField label="Street" val={details?.street} />
      <InfoField label="Purok" val={details?.purok} />
      <InfoField label="Position in Family" val={details?.householdPosition} />

      <div className="h-px bg-slate-800 my-2" />

      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
         <Phone size={14} /> Contact Details
      </p>
      <InfoField label="Mobile Number" val={details?.contact} t={{cardText: 'text-emerald-400'}} />
    </div>
  </div>
);

export default Profile;
import React from 'react';
import { User, MapPin, Phone } from 'lucide-react';
import { InfoField } from '../../common/InfoField';

const Profile = ({ data, details }) => (
  <div className="bg-slate-900 p-8 rounded-3xl text-white border-t-8 border-emerald-500 shadow-xl lg:sticky lg:top-8">
    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-8 flex items-center gap-2">
      <User size={14} /> Personal Profile
    </p>
    <div className="space-y-5">
      <InfoField label="Full Legal Name" val={data?.name} />
      <div className="grid grid-cols-2 gap-4">
        <InfoField label="Age" val={details?.age} />
        <InfoField label="Gender" val={details?.sex} />
      </div>
      <div className="grid grid-cols-2 gap-4">
         <InfoField label="Marital Status" val={details?.maritalStatus} />
         <InfoField label="Nationality" val={details?.nationality} />
      </div>
       <div className="grid grid-cols-2 gap-4">
         <InfoField label="Birth Registration" val={details?.birthRegistration} />
         <InfoField label="Sector" val={details?.sector} />
      </div>
      <div className="h-px bg-slate-800 my-4" />
      
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
         <MapPin size={14} /> Location Data
      </p>
      <InfoField label="Purok" val={details?.purok} />
      <InfoField label="Street" val={details?.street} />
      <InfoField label="House Number" val={details?.houseNumber} />
      <InfoField label="Position in Family" val={details?.householdPosition} />

      <div className="h-px bg-slate-800 my-4" />

      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
         <Phone size={14} /> Contact Details
      </p>
      <InfoField label="Mobile Number" val={details?.contact} />
    </div>
  </div>
);

export default Profile;

  import React from 'react';
  import { User, MapPin, Phone, Heart } from 'lucide-react';
  import { InfoField } from '../../common/InfoField';

  const Profile = ({ data, details, t, isIndigent }) => (
    <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-3xl border-t-8 border-emerald-500 shadow-2xl lg:sticky lg:top-8 text-white">
      <div className="flex justify-between items-start mb-8">
        <p className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
          <User size={16} /> Personal Profile
        </p>
        {/* Indigent Badge Indicator */}
        {isIndigent === 1 && (
          <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black px-2 py-1 rounded-md border border-rose-500/30 uppercase tracking-widest flex items-center gap-1">
            <Heart size={10} fill="currentColor" /> Indigent
          </span>
        )}
      </div>
      
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
        <InfoField label="Number of Families in Household" val={details?.numberOfFamilies} />
        
        {/* Dynamic Household Status Row */}
        <div className="mt-2 p-3 bg-slate-800/40 rounded-xl border border-slate-800">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Household Status</p>
          <p className={`text-xs font-bold uppercase ${isIndigent ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isIndigent ? 'Classified as Indigent' : 'Regular Household'}
          </p>
        </div>

        <div className="h-px bg-slate-800 my-2" />

        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Phone size={14} /> Contact Details
        </p>
        <InfoField label="Mobile Number" val={details?.contact} t={{cardText: 'text-emerald-400'}} />
        <InfoField label="Email Address" val={details?.email} t={{cardText: 'text-emerald-400'}} />
      </div>
    </div>
  );

  export default Profile;
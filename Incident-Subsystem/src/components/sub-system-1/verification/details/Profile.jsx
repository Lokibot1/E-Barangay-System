  import React from 'react';
  import { User, MapPin, Phone, Heart } from 'lucide-react';

  const Profile = ({ data, details, t, isIndigent }) => {
    const labelClass = `text-[10px] ${t.subtleText} font-medium`;
    const valueClass = `text-sm font-semibold ${t.cardText}`;

    const Field = ({ label, val, valueClassName }) => (
      <div className="flex flex-col items-start gap-1">
        <p className={labelClass}>{label}</p>
        <p className={valueClassName || valueClass}>{val || '---'}</p>
      </div>
    );

    return (
      <div className={`${t.cardBg} p-6 sm:p-7 rounded-[26px] border ${t.cardBorder} border-t-4 border-t-emerald-500 shadow-[0_12px_30px_rgba(15,23,42,0.08)] lg:sticky lg:top-8`}>
        <div className="flex justify-between items-start mb-6">
          <p className={`text-xs font-semibold ${t.subtleText} flex items-center gap-2`}>
            <User size={16} className="text-emerald-500" /> Personal Profile
          </p>
          {/* Indigent Badge Indicator */}
          {isIndigent === 1 && (
            <span className="bg-rose-50 text-rose-500 text-[10px] font-semibold px-2 py-1 rounded-md border border-rose-200 flex items-center gap-1">
              <Heart size={10} fill="currentColor" /> Indigent
            </span>
          )}
        </div>
        
        <div className="space-y-6">
          <Field label="Full Legal Name" val={data?.name} />
          
          <div className="grid grid-cols-2 gap-6">
            <Field label="Age" val={details?.age} />
            <Field label="Gender" val={details?.sex} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Marital Status" val={details?.maritalStatus} />
            <Field label="Nationality" val={details?.nationality} />
          </div>

          <div className={`h-px ${t.cardBorder}`} />

          <p className={`text-[10px] font-semibold ${t.subtleText} mb-4 flex items-center gap-2`}>
            <MapPin size={14} className="text-emerald-500" /> Location Data
          </p>
          <Field label="House Number" val={details?.houseNumber} />
          <Field label="Street" val={details?.street} />
          <Field label="Purok" val={details?.purok} />
          <Field label="Position in Family" val={details?.householdPosition} />
          <Field label="Number of Families in Household" val={details?.numberOfFamilies} />
          
          {/* Dynamic Household Status Row */}
          <div className={`mt-2 p-3 ${t.inlineBg} rounded-xl border ${t.cardBorder}`}>
            <p className={`text-[10px] font-medium ${t.subtleText} mb-1`}>Household Status</p>
            <p className={`text-xs font-semibold ${isIndigent ? 'text-rose-500' : 'text-emerald-600'}`}>
              {isIndigent ? 'Classified as Indigent' : 'Regular Household'}
            </p>
          </div>

          <div className={`h-px ${t.cardBorder}`} />

          <p className={`text-[10px] font-semibold ${t.subtleText} mb-4 flex items-center gap-2`}>
              <Phone size={14} className="text-emerald-500" /> Contact Details
          </p>
          <Field label="Mobile Number" val={details?.contact} valueClassName="text-sm font-semibold text-emerald-600" />
          <Field label="Email Address" val={details?.email} valueClassName="text-sm font-semibold text-emerald-600" />
        </div>
      </div>
    );
  };

  export default Profile;

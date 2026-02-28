import React from 'react';
import { Home, Users, MapPin, User, ShieldCheck } from 'lucide-react';
import ModalWrapper from '../common/ModalWrapper';

const HouseholdModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Household: ${data.household_id || 'PENDING ID'}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <User size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">Head of Family</span>
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase">{data.head}</p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Users size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Members</span>
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">
                {data.members} <span className="text-xs font-bold text-slate-400 ml-1">Registered Persons</span>
            </p>
          </div>
        </div>
        
{/* NEW: Housing Survey Section */}
<div className="grid grid-cols-3 gap-3 mb-6">
  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-center">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure Status</p>
    <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{data.tenure_status || 'N/A'}</p>
  </div>
  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-center">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Wall Material</p>
    <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{data.wall_material || 'N/A'}</p>
  </div>
  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-center">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Roof Material</p>
    <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{data.roof_material || 'N/A'}</p>
  </div>
</div>
        {/* Technical & Location Details */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent Address</p>
                 <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">
  {data.address || 'No Address Provided'} (Purok {data.purok})
</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-3 border-l dark:border-slate-700 pl-0 md:pl-6">
               <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={18} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indigent Status</p>
                 <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${Number(data.is_indigent) === 1 ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
  {Number(data.is_indigent) === 1 ? 'YES (INDIGENT)' : 'NO (GENERAL)'}
</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Family Composition Table */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
             <h4 className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                <Users size={16} className="text-emerald-600" /> Family Composition
             </h4>
             <span className="text-[10px] font-bold text-slate-400 uppercase">Established: {new Date(data.established_date).toLocaleDateString()}</span>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-4 tracking-tighter">Full Name</th>
                  <th className="px-5 py-4">Relationship</th>
                  <th className="px-5 py-4 text-center">Age</th>
                  <th className="px-5 py-4">Sector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.memberList?.length > 0 ? (
                    data.memberList.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-5 py-4 font-black text-slate-700 dark:text-slate-300 uppercase text-xs">{m.name}</td>
                            <td className="px-5 py-4 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-tight">{m.relation}</td>
                            <td className="px-5 py-4 text-center text-slate-500 font-bold">{m.age}</td>
                            <td className="px-5 py-4">
                            <span className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg font-black text-slate-500 dark:text-slate-400 uppercase">
                                {m.sector || 'General'}
                            </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-xs font-bold text-slate-400 italic">No family members registered yet.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default HouseholdModal;
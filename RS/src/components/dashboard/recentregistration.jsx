import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import Table from '../common/table';
import { getInitials, getAvatarColor } from '../../utils/avatar';

const RecentRegistration = ({ registrations = [] }) => {
  const headers = ["Name", "Age", "Address", "Purok", "ID Status"];

  return (
    <Table title="Recent Registration" headers={headers}>
      {registrations.length > 0 ? (
        registrations.map((person) => (
          <tr 
            key={person.id} 
            className="border-b last:border-none border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group"
          >
            {/* Name Column: Larger Text & Avatar Style */}
            <td className="px-6 py-5 whitespace-nowrap">
              <div className="flex items-center gap-4">
                <div className={`h-11 w-11 rounded-full border-2 border-white dark:border-slate-700 shadow-xl flex items-center justify-center font-bold text-sm ${getAvatarColor(person.name)}`}>
                  {getInitials(person.name)}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {person.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-0.5 uppercase tracking-tight">
                    {(person.role || 'Resident')}
                  </p>
                </div>
              </div>
            </td>

            {/* Age & Address: Standardized to text-base (16px) */}
            <td className="px-6 py-5 text-base text-slate-800 dark:text-slate-200 font-medium">
              {person.age}
            </td>
            
            <td className="px-6 py-5 text-base text-slate-700 dark:text-slate-300 truncate max-w-[250px]">
              {person.address}
            </td>

            {/* Purok: Bold focus */}
            <td className="px-6 py-5 text-base font-bold text-slate-900 dark:text-white">
              Purok {person.purok}
            </td>

            {/* Status Badge: Bigger font and icons (Matched with ResidentTable) */}
            <td className="px-6 py-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-tight ${
                person.status === 'Verified' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                {person.status === 'Verified' 
                  ? <CheckCircle size={18} strokeWidth={2.5} /> 
                  : <Clock size={18} strokeWidth={2.5} />
                }
                <span>{person.status}</span>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={5} className="px-6 py-20 text-center text-lg font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            No registrations found.
          </td>
        </tr>
      )}
    </Table>
  );
};

export default RecentRegistration;
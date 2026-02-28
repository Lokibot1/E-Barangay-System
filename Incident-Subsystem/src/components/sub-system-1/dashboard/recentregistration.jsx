import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import Table from '../common/table';
import { getInitials, getAvatarColor } from '../../../utils/avatar';

const RecentRegistration = ({ registrations = [], t }) => {
  const headers = ["Name", "Age", "Address", "Purok", "ID Status"];

  return (
    <Table title="Recent Registration" headers={headers} t={t}>
      {registrations.length > 0 ? (
        registrations.map((person) => (
          <tr
            key={person.id}
            className={`border-b last:border-none ${t.cardBorder} hover:${t.inlineBg} transition-all group`}
          >
            {/* Name Column: Larger Text & Avatar Style */}
            <td className="px-6 py-5 whitespace-nowrap">
              <div className="flex items-center gap-4">
                <div className={`h-11 w-11 rounded-full border-2 border-white shadow-xl flex items-center justify-center font-bold text-sm ${getAvatarColor(person.name)}`}>
                  {getInitials(person.name)}
                </div>
                <div>
                  <p className={`text-base font-bold ${t.cardText} leading-tight`}>
                    {person.name}
                  </p>
                  <p className={`text-sm ${t.subtleText} font-semibold mt-0.5 uppercase tracking-tight`}>
                    {(person.role || 'Resident')}
                  </p>
                </div>
              </div>
            </td>

            {/* Age & Address */}
            <td className={`px-6 py-5 text-base ${t.cardText} font-medium`}>
              {person.age}
            </td>

            <td className={`px-6 py-5 text-base ${t.subtleText} truncate max-w-[250px]`}>
              {person.address}
            </td>

            {/* Purok */}
            <td className={`px-6 py-5 text-base font-bold ${t.cardText}`}>
              Purok {person.purok}
            </td>

            {/* Status Badge */}
            <td className="px-6 py-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-tight ${
                person.status === 'Verified'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
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
          <td colSpan={5} className="px-6 py-20 text-center text-lg font-black text-slate-400 uppercase tracking-widest">
            No registrations found.
          </td>
        </tr>
      )}
    </Table>
  );
};

export default RecentRegistration;

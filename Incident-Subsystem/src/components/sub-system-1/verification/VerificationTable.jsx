import React from 'react';
import VerificationRow from './VerificationRow';

const PendingVerificationTable = ({ data, onReview, t, currentTheme }) => {
  const isDark = currentTheme === 'dark';
  const headerLabels = ["Name", "Age", "Address", "Purok", "Submitted", "Status", "Action"];

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[1040px] w-full border-separate border-spacing-0">
        <thead className={`${isDark ? 'bg-slate-900/80' : 'bg-slate-50/80'} backdrop-blur-sm`}>
          <tr>
            {headerLabels.map((header) => {
              const lower = header.toLowerCase();
              const isCentered = lower === 'age' || lower === 'action';

              return (
                <th
                  key={header}
                  className={`border-b px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] ${isCentered ? 'text-center' : 'text-left'} ${t.subtleText} ${t.cardBorder} font-kumbh`}
                >
                  {header}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className={t.cardBg}>
          {data && data.length > 0 ? (
            data.map((res, index) => (
              <VerificationRow
                key={res.id || index}
                res={res}
                onReview={onReview}
                t={t}
                currentTheme={currentTheme}
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-28 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <span className={`text-2xl font-bold ${t.cardText} font-spartan`}>
                    No verification requests found
                  </span>
                  <p className={`max-w-md text-sm leading-7 ${t.subtleText} font-medium font-kumbh`}>
                    The selected queue is clear right now. New resident submissions will appear here automatically.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PendingVerificationTable;

/**
 * HouseholdTable.jsx
 * ADDED: loading prop — renders TableSkeleton inside tbody when true.
 * All original logic preserved.
 */

import React from 'react';
import HouseholdRow from './householdrow';
import SkeletonLoader from '../common/SkeletonLoader';

const HouseholdTable = ({ households, loading = false, onView, onEdit, onDeactivate, t, currentTheme = 'modern' }) => {
  const isDark = currentTheme === 'dark';

  const headers = [
    'Household head and ID',
    'Location',
    'Classification',
    'Members',
    'Action',
  ];

  const COLS = headers.length;

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[1040px] w-full border-separate border-spacing-0">
        <colgroup>
          <col style={{ width: '32%' }} />
          <col style={{ width: '26%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '12%' }} />
        </colgroup>

        <thead className={`${isDark ? 'bg-slate-900/80' : 'bg-slate-50/80'} backdrop-blur-sm`}>
          <tr>
            {headers.map((header) => {
              const lower = header.toLowerCase();
              const isCentered = lower === 'members' || lower === 'action';
              return (
                <th
                  key={header}
                  className={`border-b px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                    isCentered ? 'text-center' : 'text-left'
                  } ${t.subtleText} ${t.cardBorder} font-kumbh`}
                >
                  {header}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className={t.cardBg}>
          {loading ? (
            <SkeletonLoader variant="table" rows={8} cols={COLS} isDark={isDark} />
          ) : households && households.length > 0 ? (
            households.map((h) => (
              <HouseholdRow
                key={h.db_id || h.id}
                item={h}
                onView={onView}
                onEdit={onEdit}
                onDeactivate={onDeactivate}
                t={t}
                currentTheme={currentTheme}
              />
            ))
          ) : (
            <tr>
              <td colSpan={COLS} className="px-6 py-28 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <span className={`text-2xl font-bold ${t.cardText} font-spartan`}>
                    No household records found
                  </span>
                  <p className={`max-w-md text-sm leading-7 ${t.subtleText} font-medium font-kumbh`}>
                    Try adjusting the current household filters to surface the family unit you need.
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

export default HouseholdTable;
import React from 'react';

const tableHeaderBgMap = {
  modern: 'bg-blue-600',
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  green: 'bg-green-600',
  dark: 'bg-slate-700',
};

const tableHeaderBorderMap = {
  modern: 'border-blue-700',
  blue: 'border-blue-700',
  purple: 'border-purple-700',
  green: 'border-green-700',
  dark: 'border-slate-600',
};

const Table = ({ title, headers, children, t, currentTheme, columnPadMap = {}, columnWidths = [] }) => {
  const resolvedTheme =
    currentTheme || (typeof window !== 'undefined' ? localStorage.getItem('appTheme') || 'modern' : 'modern');
  const cardBg = t?.cardBg ?? 'bg-white';
  const cardBorder = t?.cardBorder ?? 'border-gray-200';
  const cardText = t?.cardText ?? 'text-gray-900';
  const subtleText = t?.subtleText ?? 'text-gray-400';
  const columnCount = headers.length;
  const tableHeaderBg = tableHeaderBgMap[resolvedTheme] || tableHeaderBgMap.modern;
  const tableHeaderBorder = tableHeaderBorderMap[resolvedTheme] || tableHeaderBorderMap.modern;
  const tableHeaderText = resolvedTheme === 'dark' ? 'text-slate-100' : 'text-white';

  return (
    <div className={`w-full overflow-hidden ${cardBg} transition-colors duration-300 border ${cardBorder} shadow-sm`}>
      {title && (
        <div className={`p-6 border-b ${cardBorder}`}>
          <h3 className={`text-xl font-bold ${cardText} tracking-tight font-spartan`}>
            {title}
          </h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse ${columnWidths.length ? 'table-fixed' : ''}`}> 
          {columnWidths.length > 0 && (
            <colgroup>
              {headers.map((_, idx) => (
                <col key={idx} style={{ width: columnWidths[idx] || "auto" }} />
              ))}
            </colgroup>
          )}
          <thead className={tableHeaderBg}>
            <tr>
              {headers.map((header, index) => {
                const hLabel = header.toLowerCase();
                const isCentered =
                  hLabel.includes('action') ||
                  hLabel === 'members' ||
                  hLabel === 'age' ||
                  hLabel === 'status' ||
                  hLabel === 'sex';
                const colPadClass = columnPadMap[hLabel] || 'px-7';

                return (
                  <th
                    key={index}
                    className={`${colPadClass} py-5 ${isCentered ? 'text-center' : 'text-left'} 
                    text-base font-semibold ${tableHeaderText}
                    border-b-2 ${tableHeaderBorder} font-spartan whitespace-nowrap`}
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={`divide-y ${cardBorder} ${cardBg} transition-all duration-300`}>
           
            {React.Children.count(children) === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className={`text-sm font-bold ${cardText} opacity-40 uppercase tracking-widest`}>
                      No Records Found
                    </p>
                    <p className={`text-[11px] ${subtleText} italic font-medium`}>
                      Try adjusting your search or filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

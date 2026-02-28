import React from 'react';

const Table = ({ title, headers, children, t }) => {
  const cardBg = t?.cardBg ?? 'bg-white';
  const cardBorder = t?.cardBorder ?? 'border-gray-200';
  const cardText = t?.cardText ?? 'text-gray-900';

  return (
    <div className={`w-full overflow-hidden ${cardBg} transition-colors duration-300`}>
      {title && (
        <div className={`p-6 border-b ${cardBorder}`}>
          <h3 className={`text-xl font-black ${cardText} tracking-tight uppercase`}>
            {title}
          </h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-emerald-700">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider border-b-2 border-emerald-800"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${cardBorder} ${cardBg}`}>
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

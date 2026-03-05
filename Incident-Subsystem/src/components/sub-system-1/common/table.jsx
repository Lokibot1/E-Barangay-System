import React from 'react';

const Table = ({ title, headers, children, t }) => {
  const cardBg = t?.cardBg ?? 'bg-white';
  const cardBorder = t?.cardBorder ?? 'border-gray-200';
  const cardText = t?.cardText ?? 'text-gray-900';
  const subtleText = t?.subtleText ?? 'text-gray-400';

  const columnCount = headers.length;

  return (
    <div className={`w-full overflow-hidden ${cardBg} transition-colors duration-300 border ${cardBorder} shadow-sm`}>
      {title && (
        <div className={`p-6 border-b ${cardBorder}`}>
          <h3 className={`text-xl font-black ${cardText} tracking-tight uppercase font-spartan`}>
            {title}
          </h3>
        </div>
      )}
      
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-200">
        <table className="w-full border-collapse"> 
          <thead className="bg-emerald-700">
            <tr>
              {headers.map((header, index) => {
                const hLabel = header.toLowerCase();
              
                const isCentered = hLabel.includes('action') || 
                                   hLabel === 'members' || 
                                   hLabel === 'age' || 
                                   hLabel === 'status' || 
                                   hLabel === 'sex';

                return (
                  <th
                    key={index}
                    className={`px-6 py-5 ${isCentered ? 'text-center' : 'text-left'} 
                    text-[12px] font-black text-white uppercase tracking-wider 
                    border-b-2 border-emerald-800 font-spartan whitespace-nowrap`}
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
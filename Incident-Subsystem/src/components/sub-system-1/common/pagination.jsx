import React from 'react';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, t }) => {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  const maxVisiblePages = 5; 
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

  const cardBg = t?.cardBg ?? 'bg-white';
  const cardBorder = t?.cardBorder ?? 'border-gray-200';
  const subtleText = t?.subtleText ?? 'text-gray-400';
  const inlineBg = t?.inlineBg ?? 'bg-gray-50';

  const btnBase = `p-2 border-y border-r ${cardBorder} hover:${inlineBg} disabled:opacity-20 ${subtleText} transition-all flex items-center justify-center`;

  return (
    <div className={`p-4 ${cardBg} border-t ${cardBorder} flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300`}>
      <span className={`text-[10px] font-bold ${subtleText} uppercase tracking-[2px]`}>
        Showing {startIdx} to {endIdx} of {totalItems} records
      </span>

      <div className="flex items-center">
        {/* FIRST PAGE BUTTON */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className={`${btnBase} border-l rounded-l-lg`} 
          title="First Page"
        >
          <ChevronsLeft size={18} />
        </button>

        {/* PREVIOUS PAGE BUTTON */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={btnBase}
          title="Previous"
        >
          <ChevronLeft size={18} />
        </button>

        {/* NUMBERED PAGES */}
        <div className="flex items-center">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 text-[11px] font-black border-r border-y ${cardBorder} transition-all ${
                currentPage === page
                ? 'bg-emerald-600 text-white border-emerald-600 z-10'
                : `${cardBg} ${subtleText} hover:${inlineBg}`
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* NEXT PAGE BUTTON */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={btnBase}
          title="Next"
        >
          <ChevronRight size={18} />
        </button>

        {/* LAST PAGE BUTTON */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`${btnBase} rounded-r-lg`} 
          title="Last Page"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, t }) => {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);
  const maxVisiblePages = 10;
  const halfWindow = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
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

  return (
    <div className={`p-4 ${cardBg} border-t ${cardBorder} flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300`}>
      <span className={`text-[10px] font-bold ${subtleText} uppercase tracking-[2px]`}>
        Showing {startIdx} to {endIdx} of {totalItems} records
      </span>

      <div className="flex items-center">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`p-2 border ${cardBorder} hover:${inlineBg} disabled:opacity-30 ${subtleText} transition-all rounded-l-lg`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 text-[11px] font-black border-y border-r ${cardBorder} transition-all ${
                currentPage === page
                ? 'bg-emerald-600 text-white border-emerald-600 z-10'
                : `${cardBg} ${subtleText} hover:${inlineBg}`
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`p-2 border border-r border-y ${cardBorder} hover:${inlineBg} disabled:opacity-30 ${subtleText} transition-all rounded-r-lg`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

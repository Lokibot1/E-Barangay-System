import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
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

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2px]">
        Showing {startIdx} to {endIdx} of {totalItems} records
      </span>
      
      <div className="flex items-center">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 text-gray-600 dark:text-gray-400 transition-all rounded-l-lg"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 text-[11px] font-black border-y border-r border-gray-200 dark:border-slate-700 transition-all ${
                currentPage === page 
                ? 'bg-emerald-600 text-white border-emerald-600 z-10' 
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 border border-r border-y border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 text-gray-600 dark:text-gray-400 transition-all rounded-r-lg"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const normalizeTheme = (theme) => (theme === 'modern' ? 'blue' : theme || 'blue');

const themePalette = {
  blue: {
    accent: '#2563eb',
    accentSoft: '#dbeafe',
    accentText: '#1d4ed8',
    surface: '#f8fafc',
    border: '#cbd5e1',
    muted: '#64748b',
    shell: '#ffffff',
  },
  purple: {
    accent: '#9333ea',
    accentSoft: '#f3e8ff',
    accentText: '#7e22ce',
    surface: '#faf5ff',
    border: '#d8b4fe',
    muted: '#64748b',
    shell: '#ffffff',
  },
  green: {
    accent: '#16a34a',
    accentSoft: '#dcfce7',
    accentText: '#15803d',
    surface: '#f0fdf4',
    border: '#86efac',
    muted: '#64748b',
    shell: '#ffffff',
  },
  dark: {
    accent: '#475569',
    accentSoft: '#1e293b',
    accentText: '#e2e8f0',
    surface: '#0f172a',
    border: '#334155',
    muted: '#94a3b8',
    shell: '#111827',
  },
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  t,
  currentTheme,
}) => {
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

  const palette = themePalette[normalizeTheme(currentTheme)] || themePalette.blue;
  const cardBg = t?.cardBg ?? 'bg-white';
  const cardBorder = t?.cardBorder ?? 'border-gray-200';
  const subtleText = t?.subtleText ?? 'text-gray-500';
  const cardText = t?.cardText ?? 'text-slate-800';

  return (
    <div
      className={`flex flex-col gap-3 ${cardBg} px-3 py-3 sm:px-4 sm:py-4 transition-colors duration-300`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <span className={`text-sm font-kumbh ${subtleText}`}>
          Showing {startIdx} to {endIdx} of {totalItems} records
        </span>

        <div
          className={`flex items-center rounded-lg border overflow-hidden ${cardBg} ${cardBorder} shadow-sm`}
          style={{ backgroundColor: palette.shell, borderColor: palette.border }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className={`h-8 w-8 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${subtleText}`}
            style={{ borderRight: `1px solid ${palette.border}` }}
            title="Previous"
          >
            <ChevronLeft size={16} />
          </button>

        {/* NUMBERED PAGES */}
        <div className="flex items-center">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-8 min-w-8 px-2.5 text-sm font-kumbh transition-all ${
                currentPage === page ? 'font-semibold text-white' : `${cardText}`
              }`}
              style={{
                backgroundColor: currentPage === page ? palette.accent : 'transparent',
                color: currentPage === page ? '#ffffff' : undefined,
                borderRight:
                  page !== visiblePages[visiblePages.length - 1]
                    ? `1px solid ${palette.border}`
                    : 'none',
              }}
            >
              {page}
            </button>
          ))}
        </div>

        {/* NEXT PAGE BUTTON */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`h-8 w-8 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${subtleText}`}
          style={{ borderLeft: `1px solid ${palette.border}` }}
          title="Next"
        >
          <ChevronRight size={16} />
        </button>
        </div>
      </div>

    </div>
  );
};

export default Pagination;

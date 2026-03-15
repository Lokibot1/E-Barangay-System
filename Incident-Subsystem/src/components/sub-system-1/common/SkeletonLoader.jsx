/**
 * SkeletonLoader.jsx
 *
 * Reusable skeleton loader with four variants:
 *
 *   variant="table"   — N shimmer rows matching your table column count
 *   variant="stat"    — N stat card shimmer blocks (grid)
 *   variant="list"    — N simple horizontal bar rows (generic lists)
 *   variant="block"   — one full-width block (detail views, modals, etc.)
 *
 * Usage examples:
 *
 *   // Inside a table tbody — matches your existing table shell exactly
 *   <SkeletonLoader variant="table" rows={6} cols={7} isDark={isDark} />
 *
 *   // Stat cards section
 *   <SkeletonLoader variant="stat" count={4} isDark={isDark} />
 *
 *   // Generic list
 *   <SkeletonLoader variant="list" rows={5} isDark={isDark} />
 *
 *   // Full block (e.g. detail view loading)
 *   <SkeletonLoader variant="block" isDark={isDark} />
 *
 * All variants respect isDark automatically using Tailwind dark-mode-safe classes.
 * No extra CSS needed — just `animate-pulse` from Tailwind.
 */

import React from 'react';

// ── Primitive shimmer building block ─────────────────────────────────────────
const Shimmer = ({ className = '', isDark = false }) => (
  <div
    className={`rounded-xl animate-pulse ${
      isDark ? 'bg-slate-700/60' : 'bg-slate-200/80'
    } ${className}`}
  />
);

// ── Table variant ─────────────────────────────────────────────────────────────
// Renders as <tr> rows so it drops directly inside a <tbody>.
// Pass it as a child of your table body when loading=true.
const TableSkeleton = ({ rows = 6, cols = 7, isDark = false }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <tr key={rowIdx} className={isDark ? 'border-slate-800/60' : 'border-slate-100'}>
        {Array.from({ length: cols }).map((_, colIdx) => (
          <td key={colIdx} className="px-6 py-5 border-b border-inherit align-middle">
            {colIdx === 0 ? (
              // First column: name block with a subtitle line
              <div className="flex flex-col gap-1.5">
                <Shimmer className="h-3.5 w-32" isDark={isDark} />
                <Shimmer className="h-2.5 w-20 opacity-60" isDark={isDark} />
              </div>
            ) : colIdx === cols - 1 ? (
              // Last column: action button stub, centered
              <div className="flex justify-center">
                <Shimmer className="h-8 w-20" isDark={isDark} />
              </div>
            ) : (
              // Middle columns: single bar, varying width for visual rhythm
              <Shimmer
                className={`h-3 ${['w-24', 'w-16', 'w-28', 'w-14', 'w-20'][colIdx % 5]}`}
                isDark={isDark}
              />
            )}
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ── Stat card variant ─────────────────────────────────────────────────────────
const StatSkeleton = ({ count = 4, isDark = false }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`rounded-[26px] border p-5 sm:p-6 ${
          isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <Shimmer className="h-2.5 w-20" isDark={isDark} />
            <Shimmer className="h-8 w-12" isDark={isDark} />
          </div>
          <Shimmer className="h-10 w-10 shrink-0 rounded-[16px]" isDark={isDark} />
        </div>
        <Shimmer className="h-10 w-full mt-5 rounded-[18px]" isDark={isDark} />
      </div>
    ))}
  </div>
);

// ── List variant ──────────────────────────────────────────────────────────────
const ListSkeleton = ({ rows = 5, isDark = false }) => (
  <div className="space-y-3 p-6">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Shimmer className="h-9 w-9 shrink-0 rounded-xl" isDark={isDark} />
        <div className="flex-1 space-y-2">
          <Shimmer className={`h-3 ${i % 2 === 0 ? 'w-3/4' : 'w-1/2'}`} isDark={isDark} />
          <Shimmer className="h-2.5 w-1/3 opacity-60" isDark={isDark} />
        </div>
        <Shimmer className="h-7 w-16 shrink-0" isDark={isDark} />
      </div>
    ))}
  </div>
);

// ── Block variant ─────────────────────────────────────────────────────────────
const BlockSkeleton = ({ isDark = false }) => (
  <div className="p-8 space-y-5">
    <Shimmer className="h-5 w-48" isDark={isDark} />
    <Shimmer className="h-3.5 w-full" isDark={isDark} />
    <Shimmer className="h-3.5 w-5/6" isDark={isDark} />
    <Shimmer className="h-3.5 w-4/6" isDark={isDark} />
    <div className="grid grid-cols-2 gap-4 pt-2">
      <Shimmer className="h-24 rounded-2xl" isDark={isDark} />
      <Shimmer className="h-24 rounded-2xl" isDark={isDark} />
    </div>
    <Shimmer className="h-3.5 w-full" isDark={isDark} />
    <Shimmer className="h-3.5 w-3/4" isDark={isDark} />
  </div>
);

// ── Main export ───────────────────────────────────────────────────────────────
const SkeletonLoader = ({
  variant = 'table',
  rows    = 6,
  cols    = 7,
  count   = 4,
  isDark  = false,
}) => {
  switch (variant) {
    case 'stat':  return <StatSkeleton  count={count} isDark={isDark} />;
    case 'list':  return <ListSkeleton  rows={rows}   isDark={isDark} />;
    case 'block': return <BlockSkeleton              isDark={isDark} />;
    case 'table':
    default:      return <TableSkeleton rows={rows} cols={cols} isDark={isDark} />;
  }
};

export { TableSkeleton, StatSkeleton, ListSkeleton, BlockSkeleton };
export default SkeletonLoader;
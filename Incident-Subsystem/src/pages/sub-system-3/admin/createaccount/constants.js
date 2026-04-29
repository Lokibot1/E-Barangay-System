export const ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to account controls and system actions.',
    activeClass: 'border-violet-300 bg-violet-50 text-violet-700 shadow-[0_18px_40px_rgba(139,92,246,0.14)]',
  },
  {
    value: 'staff1',
    label: 'Staff 1 (Resident Information)',
    description: 'Resident information access (Residents, Households, logs, archives).',
    activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_18px_40px_rgba(16,185,129,0.14)]',
  },
  {
    value: 'staff2',
    label: 'Staff 2 (Incidents & Complaints)',
    description: 'Incidents & complaints access (no resident registry).',
    activeClass: 'border-amber-300 bg-amber-50 text-amber-700 shadow-[0_18px_40px_rgba(245,158,11,0.14)]',
  },
  {
    value: 'staff3',
    label: 'Staff 3 (Document Requests)',
    description: 'Document requests access (no resident registry).',
    activeClass: 'border-sky-300 bg-sky-50 text-sky-700 shadow-[0_18px_40px_rgba(14,165,233,0.14)]',
  },
];

export const ITEMS_PER_PAGE = 15;
export const HEADERS_ACTIVE = ['User', 'Role', 'Status', 'Actions'];
export const HEADERS_INACTIVE = ['User', 'Role', 'Status'];
export const TABS = ['active', 'inactive'];


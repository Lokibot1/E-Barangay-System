export const ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to account controls and system actions.',
    activeClass: 'border-violet-300 bg-violet-50 text-violet-700 shadow-[0_18px_40px_rgba(139,92,246,0.14)]',
  },
  {
    value: 'staff',
    label: 'Staff',
    description: 'Operational access for day-to-day barangay processing.',
    activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_18px_40px_rgba(16,185,129,0.14)]',
  },
];

export const ITEMS_PER_PAGE = 15;
export const HEADERS_ACTIVE = ['User', 'Role', 'Status', 'Actions'];
export const HEADERS_INACTIVE = ['User', 'Role', 'Status'];
export const TABS = ['active', 'inactive'];


import React from 'react';
import { AlertCircle, Crown, RefreshCw, User } from 'lucide-react';
import Table from '../../../../../components/sub-system-1/common/table';
import Pagination from '../../../../../components/sub-system-1/common/pagination';
import { getInitials, getRoleStyle, normaliseActive } from '../utils';
import { getRoleLabel } from '../../../../../utils/roles';

const AccountsTableSection = ({
  t,
  isDark,
  currentTheme,
  activeTab,
  tableHeaders,
  fetching,
  fetchError,
  currentItems,
  filteredLength,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onToggle,
  onResetPassword,
}) => (
  <div className={`rounded-[2rem] overflow-hidden border ${t.cardBorder} shadow-sm`}>
    {fetchError ? (
      <div className={`flex items-center justify-center gap-3 py-20 ${t.cardBg} text-rose-500`}>
        <AlertCircle size={18} />
        <span className="text-sm font-semibold font-kumbh">{fetchError}</span>
      </div>
    ) : (
      <>
        <Table
          headers={tableHeaders}
          loading={fetching}
          skeletonRows={6}
          t={t}
          currentTheme={currentTheme}
          columnWidths={activeTab === 'active' ? ['44%', '18%', '18%', '20%'] : ['52%', '22%', '26%']}
        >
          {currentItems.length === 0 && !fetching ? (
            <tr>
              <td colSpan={tableHeaders.length} className={`py-16 text-center text-sm font-medium font-kumbh ${t.subtleText}`}>
                No {activeTab} accounts found.
              </td>
            </tr>
          ) : currentItems.map((user) => {
            const isActive = normaliseActive(user.is_active) === 1;

            return (
              <tr key={user.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50/70'}`}>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0 ${
                      user.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      {getInitials(user.name || user.username)}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className={`font-bold text-sm leading-tight font-kumbh ${t.cardText}`}>{user.name || '-'}</p>
                      <p className={`text-[11px] font-medium mt-0.5 font-kumbh ${t.subtleText}`}>
                        @{user.username}{user.email ? ` · ${user.email}` : ''}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`inline-flex min-w-[92px] items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border ${getRoleStyle(user.role)}`}>
                      {user.role === 'admin' ? <Crown size={10} /> : <User size={10} />}
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggle(user)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isActive ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>

                {activeTab === 'active' && (
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onResetPassword(user)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold font-kumbh border active:scale-95 transition-all ${
                        isDark
                          ? 'border-slate-600 text-slate-300 hover:border-sky-500 hover:text-sky-400 hover:bg-sky-900/20'
                          : 'text-slate-500 border-slate-200 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50'
                      }`}
                    >
                      <RefreshCw size={11} /> Reset Pass
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </Table>

        {!fetching && (
          <div className={`${t.cardBg} border-t ${t.cardBorder}`}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              totalItems={filteredLength}
              itemsPerPage={itemsPerPage}
              currentTheme={currentTheme}
            />
          </div>
        )}
      </>
    )}
  </div>
);

export default AccountsTableSection;

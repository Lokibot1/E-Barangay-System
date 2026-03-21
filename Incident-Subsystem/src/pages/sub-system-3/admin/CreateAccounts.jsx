import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield, UserPlus, Search, Eye, EyeOff, CheckCircle,
  RefreshCw, ToggleLeft, ToggleRight, X, AlertCircle,
  Crown, Users, UserX, User, Loader2, Mail, AtSign, LockKeyhole,
} from 'lucide-react';
import api        from '../../../services/sub-system-1/Api';
import Table      from '../../../components/sub-system-1/common/table';
import Pagination from '../../../components/sub-system-1/common/pagination';
import themeTokens from '../../../Themetokens';

// ── Role config ───────────────────────────────────────────────────────────────
const ROLES = [
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

const getRoleStyle = (role) => {
  if (role === 'admin') return 'bg-violet-100 text-violet-700 border-violet-200';
  if (role === 'staff') return 'bg-sky-100 text-sky-700 border-sky-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const getRoleIcon = (role) => {
  if (role === 'admin') return <Crown size={10} />;
  return <User size={10} />;
};

const normaliseActive = (val) => {
  if (val === null || val === undefined || val === '' || val === false || val === 0 || val === '0') return 0;
  return 1;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const getModalFieldClass = (isDark) => (
  isDark
    ? 'border-slate-700 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/10'
    : 'border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.75)] focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10'
);

const TextInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  className = '',
  disabled = false,
  isDark = false,
  required = false,
}) => (
  <div className={`group flex items-center gap-2.5 rounded-[1.1rem] border px-3.5 py-2.5 transition-all disabled:opacity-50 ${getModalFieldClass(isDark)} ${className}`}>
    {Icon ? (
      <Icon
        size={14}
        className={`${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-600'} transition-colors`}
      />
    ) : null}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full bg-transparent outline-none text-[13px] font-kumbh font-normal disabled:cursor-not-allowed"
    />
  </div>
);

const PasswordInput = ({ placeholder, value, onChange, show, className = '', disabled = false, isDark = false }) => (
  <div className={`group flex items-center gap-2.5 rounded-[1.1rem] border px-3.5 py-2.5 transition-all disabled:opacity-50 ${getModalFieldClass(isDark)} ${className}`}>
    <LockKeyhole
      size={14}
      className={`${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-600'} transition-colors`}
    />
    <input
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
      className="w-full bg-transparent outline-none text-[13px] font-kumbh font-normal disabled:cursor-not-allowed"
    />
  </div>
);

const StatCard = ({ label, value, icon: Icon, color, isDark }) => (
  <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${color}`}>
    <div className={`p-2 rounded-xl ${isDark ? 'bg-black/20' : 'bg-white/60'}`}><Icon size={16} className="opacity-70" /></div>
    <div>
      <p className="text-xl font-black leading-none">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5">{label}</p>
    </div>
  </div>
);

const ITEMS_PER_PAGE    = 15;
const HEADERS_ACTIVE    = ['User', 'Role', 'Status', 'Actions'];
const HEADERS_INACTIVE  = ['User', 'Role', 'Status'];
const TABS              = ['active', 'inactive'];

// =============================================================================

const CreateAccounts = () => {

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'modern');
  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);
  const t      = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === 'dark';

  // ── Data ──────────────────────────────────────────────────────────────────
  const [staffUsers, setStaffUsers] = useState([]);
  const [fetching,   setFetching]   = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchAll = useCallback(async () => {
    setFetching(true); setFetchError(null);
    try {
      const res = await api.get('/accounts');
      setStaffUsers(
        (res.data || []).map(u => ({ ...u, is_active: normaliseActive(u.is_active) }))
      );
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load accounts.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState('active');
  const [searchTerm,    setSearchTerm]    = useState('');
  const [currentPage,   setCurrentPage]   = useState(1);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [resetTarget,   setResetTarget]   = useState(null);
  const [pendingToggle, setPendingToggle] = useState(null);
  const [successData,   setSuccessData]   = useState(null);
  const [showPass,      setShowPass]      = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [apiError,      setApiError]      = useState('');

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', email: '', username: '', password: '', confirmPassword: '', role: 'staff',
  });
  const [resetForm, setResetForm] = useState({ pass: '', confirm: '' });

  // ── Derived pools ─────────────────────────────────────────────────────────
  const staffActive   = useMemo(() => staffUsers.filter(u => normaliseActive(u.is_active) === 1), [staffUsers]);
  const staffInactive = useMemo(() => staffUsers.filter(u => normaliseActive(u.is_active) !== 1), [staffUsers]);

  const poolForTab = useMemo(() => ({
    active:   staffActive,
    inactive: staffInactive,
  }), [staffActive, staffInactive]);

  // ── Validation ────────────────────────────────────────────────────────────
  const isGmail      = form.email.toLowerCase().endsWith('@gmail.com');
  const isEmailTaken = staffUsers.some(u => u.email?.toLowerCase() === form.email.toLowerCase().trim());
  const isPassMatch  = form.password !== '' && form.password === form.confirmPassword;
  const isComplete   = form.name && form.username && form.email && form.password && form.confirmPassword;
  const canSave      = isComplete && isGmail && !isEmailTaken && isPassMatch;
  const canReset     = resetForm.pass !== '' && resetForm.pass === resetForm.confirm;

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const pool = poolForTab[activeTab] || [];
    const q    = searchTerm.toLowerCase();
    return pool.filter(u =>
      !q ||
      (u.name     || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email    || '').toLowerCase().includes(q)
    );
  }, [poolForTab, activeTab, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm]);

  const totalPages   = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalAdmins = staffUsers.filter(u => u.role === 'admin').length;

  const tabCounts = {
    active:   staffActive.length,
    inactive: staffInactive.length,
  };

  // ── API handlers ──────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!canSave) return;
    setSubmitting(true); setApiError('');
    try {
      const res     = await api.post('/accounts', {
        name: form.name, email: form.email,
        username: form.username, password: form.password, role: form.role,
      });
      const newUser = res.data.user || res.data;
      setStaffUsers(prev => [{ ...newUser, is_active: 1 }, ...prev]);
      setShowAddModal(false);
      setSuccessData(newUser);
      setForm({ name: '', email: '', username: '', password: '', confirmPassword: '', role: 'staff' });
      setShowPass(false);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!canReset || !resetTarget) return;
    setSubmitting(true); setApiError('');
    try {
      await api.put(`/accounts/${resetTarget.id}/password`, { password: resetForm.pass });
      setResetTarget(null);
      setResetForm({ pass: '', confirm: '' });
      setShowResetPass(false);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;
    setSubmitting(true); setApiError('');
    try {
      const currentlyActive = normaliseActive(pendingToggle.is_active) === 1;
      const expectedNew     = currentlyActive ? 0 : 1;
      const res             = await api.put(`/accounts/${pendingToggle.id}/toggle`);
      const serverValue     = res.data?.is_active != null
        ? normaliseActive(res.data.is_active)
        : expectedNew;

      setStaffUsers(prev => prev.map(u =>
        u.id === pendingToggle.id ? { ...u, is_active: serverValue } : u
      ));
      setPendingToggle(null);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeAdd = () => {
    setShowAddModal(false);
    setForm({ name: '', email: '', username: '', password: '', confirmPassword: '', role: 'staff' });
    setShowPass(false); setApiError('');
  };

  const closeReset = () => {
    setResetTarget(null);
    setResetForm({ pass: '', confirm: '' });
    setShowResetPass(false); setApiError('');
  };

  const tableHeaders = activeTab === 'active' ? HEADERS_ACTIVE : HEADERS_INACTIVE;

  // ── Input base class ───────────────────────────────────────────────────────
  const inputBase = isDark
    ? 'border-slate-600 bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:bg-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-700'
    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100';

  // ==========================================================================
  return (
    <div className={`min-h-full ${t.pageBg} font-kumbh`}>
      <div className="w-full px-4 sm:px-5 py-6 sm:py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className={t.subtleText} />
              <span className={`text-[10px] font-semibold font-kumbh ${t.subtleText}`}>System Access</span>
            </div>
            <h1 className={`text-3xl font-semibold font-spartan ${t.cardText}`}>Account Management</h1>
          </div>
          <button
            type="button"
            onClick={() => { setShowAddModal(true); setApiError(''); }}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white text-xs font-semibold font-kumbh shadow-lg active:scale-95 transition-all bg-gradient-to-r ${t.primaryGrad} hover:opacity-90`}
          >
            <UserPlus size={15} /> New Account
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard isDark={isDark} label="Active"   value={staffActive.length}   icon={Users} color={isDark ? 'border-emerald-700/40 bg-emerald-900/20 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800'} />
          <StatCard isDark={isDark} label="Inactive" value={staffInactive.length} icon={UserX} color={isDark ? 'border-rose-700/40 bg-rose-900/20 text-rose-300'         : 'border-rose-200 bg-rose-50 text-rose-800'}           />
          <StatCard isDark={isDark} label="Admins"   value={totalAdmins}          icon={Crown} color={isDark ? 'border-violet-700/40 bg-violet-900/20 text-violet-300'   : 'border-violet-200 bg-violet-50 text-violet-800'}     />
        </div>

        {/* ── Search ── */}
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-[2rem] p-5`}>
          <div className="relative">
            <Search size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.subtleText}`} />
            <input
              type="text"
              placeholder="Search name, username, or email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 rounded-2xl border text-sm font-medium font-kumbh transition-all outline-none ${inputBase} ${isDark ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'}`}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${t.subtleText} hover:text-rose-500`}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Active / Inactive Tabs ── */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl w-fit ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {TABS.map(tab => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold font-kumbh transition-all ${
                activeTab === tab
                  ? isDark ? 'bg-slate-700 text-slate-100 shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200'   : 'text-slate-400 hover:text-slate-600'
              }`}>
              {tab === 'active' ? <><Users size={12} /> Active</> : <><UserX size={12} /> Inactive</>}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                activeTab === tab
                  ? tab === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                  : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
              }`}>
                {fetching ? '—' : tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className={`rounded-[2rem] overflow-hidden border ${t.cardBorder} shadow-sm`}>
          {fetchError ? (
            <div className={`flex items-center justify-center gap-3 py-20 ${t.cardBg} text-rose-500`}>
              <AlertCircle size={18} /><span className="text-sm font-semibold font-kumbh">{fetchError}</span>
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
                ) : currentItems.map(u => {
                  const isActive = normaliseActive(u.is_active) === 1;
                  return (
                    <tr key={u.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50/70'}`}>

                      {/* Identity */}
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-3 text-left">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0 ${
                            u.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600'
                          }`}>
                            {(u.name || u.username || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <p className={`font-bold text-sm leading-tight font-kumbh ${t.cardText}`}>{u.name || '—'}</p>
                            <p className={`text-[11px] font-medium mt-0.5 font-kumbh ${t.subtleText}`}>
                              @{u.username}{u.email ? ` · ${u.email}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex min-w-[92px] items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border ${getRoleStyle(u.role)}`}>
                            {getRoleIcon(u.role)} {u.role === 'admin' ? 'Admin' : u.role === 'staff' ? 'Staff' : u.role}
                          </span>
                        </div>
                      </td>

                      {/* Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button type="button" onClick={() => setPendingToggle(u)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isActive ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
                          }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            isActive ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>

                      {/* Reset Pass — active tab only */}
                      {activeTab === 'active' && (
                        <td className="px-6 py-4 text-center">
                          <button type="button"
                            onClick={() => {
                              setResetTarget(u);
                              setShowResetPass(false);
                              setResetForm({ pass: '', confirm: '' });
                              setApiError('');
                            }}
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
                    onPageChange={setCurrentPage}
                    totalItems={filtered.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentTheme={currentTheme}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ════════ ADD ACCOUNT MODAL ════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-3xl">
              <div className={`relative flex w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[1.75rem] border shadow-[0_26px_56px_-24px_rgba(15,23,42,0.34)] animate-in zoom-in-95 duration-200 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-white/70 bg-white'}`}>
            <div className={`relative flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? 'bg-emerald-500/15 text-emerald-300 shadow-[0_10px_24px_rgba(16,185,129,0.10)]' : 'bg-emerald-500 text-white shadow-[0_10px_24px_rgba(34,197,94,0.18)]'}`}>
                  <UserPlus size={16} />
                </div>
                <div className="min-w-0 flex-1 pt-1 text-left">
                  <h2 className={`text-[1.2rem] leading-none font-semibold font-spartan ${t.cardText}`}>Create Account</h2>
                  <p className={`mt-1 text-[10px] leading-[1.35] font-medium font-kumbh ${t.subtleText}`}>
                    Enter the full name, Gmail address, username, role and password for this user.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAdd}
                className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="relative flex min-h-0 flex-1 flex-col px-4 sm:px-5 py-4 sm:py-5">
              <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
                {apiError && (
                  <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-kumbh ${isDark ? 'bg-rose-950/30 border border-rose-800 text-rose-300' : 'bg-rose-50 border border-rose-200 text-rose-600'}`}>
                    <AlertCircle size={15} className="shrink-0" /> {apiError}
                  </div>
                )}
                <div className={`overflow-hidden rounded-[1.35rem] border p-3.5 sm:p-4 lg:p-4.5 ${isDark ? 'border-slate-800 bg-slate-950/45' : 'border-slate-200 bg-slate-50/70'}`}>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-1.5 lg:col-span-2">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Legal Full Name</label>
                      <TextInput
                        icon={User}
                        placeholder="e.g. Juan Dela Cruz"
                        value={form.name}
                        required
                        isDark={isDark}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Gmail Address</label>
                      <TextInput
                        type="email"
                        icon={Mail}
                        placeholder="name@gmail.com"
                        value={form.email}
                        required
                        isDark={isDark}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className={
                          form.email && (!isGmail || isEmailTaken)
                            ? 'border-rose-400 bg-rose-50 text-rose-700'
                            : form.email && isGmail && !isEmailTaken
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : ''
                        }
                      />
                      <div className="min-h-[16px]">
                        {form.email && !isGmail && (
                          <p className="text-[10px] font-semibold font-kumbh text-rose-500 flex items-center gap-1">
                            <AlertCircle size={10} /> Gmail only
                          </p>
                        )}
                        {form.email && isEmailTaken && (
                          <p className="text-[10px] font-semibold font-kumbh text-rose-500 flex items-center gap-1">
                            <AlertCircle size={10} /> Already taken
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Username</label>
                      <TextInput
                        icon={AtSign}
                        placeholder="bgn00001"
                        value={form.username}
                        required
                        isDark={isDark}
                        onChange={e => setForm({ ...form, username: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Role</label>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {ROLES.map(r => {
                          const RoleIcon = r.value === 'admin' ? Crown : User;
                          const selected = form.role === r.value;
                          return (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => setForm({ ...form, role: r.value })}
                              className={`rounded-[1.1rem] border px-3.5 py-2.5 text-center transition-all ${
                                selected
                                  ? r.activeClass
                                  : isDark
                                    ? 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2.5">
                                <RoleIcon
                                  size={15}
                                  className={
                                    selected
                                      ? r.value === 'admin'
                                        ? 'text-violet-700'
                                        : 'text-emerald-700'
                                      : isDark
                                        ? 'text-slate-400'
                                        : 'text-slate-500'
                                  }
                                />
                                <p className="text-[13px] font-semibold font-kumbh">{r.label}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold font-kumbh text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          {showPass ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Show</>}
                        </button>
                      </div>
                      <div className="grid gap-2.5 md:grid-cols-2">
                        <PasswordInput
                          isDark={isDark}
                          placeholder="New password"
                          value={form.password}
                          onChange={e => setForm({ ...form, password: e.target.value })}
                          show={showPass}
                        />
                        <PasswordInput
                          isDark={isDark}
                          placeholder="Confirm password"
                          value={form.confirmPassword}
                          onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                          show={showPass}
                          className={
                            form.confirmPassword && !isPassMatch
                              ? 'border-rose-400 bg-rose-50'
                              : form.confirmPassword && isPassMatch
                                ? 'border-emerald-400 bg-emerald-50'
                                : ''
                          }
                        />
                      </div>
                      <div className="min-h-[16px]">
                        {form.confirmPassword && !isPassMatch && (
                          <p className="text-[10px] font-semibold font-kumbh text-rose-500 flex items-center gap-1">
                            <AlertCircle size={10} /> Passwords do not match
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`mt-4 flex justify-end border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeAdd}
                    disabled={submitting}
                    className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-[11px] font-semibold font-kumbh border transition-colors disabled:opacity-50 ${
                      isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={!canSave || submitting}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-semibold font-kumbh text-white transition-all active:scale-[0.98] ${
                      canSave && !submitting
                        ? `bg-gradient-to-r ${t.primaryGrad} shadow-lg hover:opacity-90`
                        : isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}>
                    {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving...</span> : <><UserPlus size={14} /> Save Account</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
          </div>
        </div>
        </div>
      )}

      {/* ════════ RESET PASSWORD MODAL ════════ */}
      {resetTarget && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between px-7 py-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div>
                <p className={`text-[10px] font-semibold font-kumbh ${t.subtleText}`}>Account Security</p>
                <h3 className={`text-base font-semibold font-spartan ${t.cardText}`}>Reset Password</h3>
              </div>
              <button type="button" onClick={closeReset} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}><X size={16} /></button>
            </div>
            <div className={`mx-7 mt-5 flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0 border ${getRoleStyle(resetTarget.role)}`}>
                {(resetTarget.name || resetTarget.username || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-bold leading-tight font-kumbh ${t.cardText}`}>{resetTarget.name}</p>
                <p className={`text-[10px] font-medium font-kumbh ${t.subtleText}`}>@{resetTarget.username} · <span className="capitalize">{resetTarget.role}</span></p>
              </div>
            </div>
            <form onSubmit={handleResetSubmit} className="px-7 py-5 space-y-3">
              {apiError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-semibold font-kumbh">
                  <AlertCircle size={15} className="shrink-0" /> {apiError}
                </div>
              )}
              <div className="flex items-center justify-between mb-1">
                <label className={`text-[10px] font-semibold font-kumbh ${t.subtleText}`}>New Password</label>
                <button type="button" onClick={() => setShowResetPass(!showResetPass)}
                  className="flex items-center gap-1 text-[9px] font-semibold font-kumbh text-sky-500 hover:text-sky-700 transition-colors">
                  {showResetPass ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Show</>}
                </button>
              </div>
              <PasswordInput isDark={isDark} placeholder="New password"         value={resetForm.pass}    onChange={e => setResetForm({ ...resetForm, pass: e.target.value })}    show={showResetPass} />
              <PasswordInput isDark={isDark} placeholder="Confirm new password" value={resetForm.confirm} onChange={e => setResetForm({ ...resetForm, confirm: e.target.value })} show={showResetPass}
                className={resetForm.confirm && resetForm.pass !== resetForm.confirm ? 'border-rose-400 bg-rose-50' : resetForm.confirm && canReset ? 'border-emerald-400 bg-emerald-50' : ''} />
              {resetForm.confirm && !canReset && (
                <p className="text-[9px] font-semibold font-kumbh text-rose-500 flex items-center gap-1"><AlertCircle size={9} /> Passwords do not match</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeReset} disabled={submitting}
                  className={`flex-1 py-3 rounded-2xl text-xs font-semibold font-kumbh border transition-colors disabled:opacity-50 ${
                    isDark ? 'border-slate-600 text-slate-400 hover:bg-slate-800' : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                  }`}>Cancel</button>
                <button type="submit" disabled={!canReset || submitting}
                  className={`flex-[2] py-3 rounded-2xl text-xs font-semibold font-kumbh text-white transition-all active:scale-[0.98] ${
                    canReset && !submitting ? 'bg-sky-600 hover:bg-sky-700 shadow-lg' : isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}>
                  {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Resetting…</span> : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ TOGGLE CONFIRMATION ════════ */}
      {pendingToggle && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className={`w-full max-w-xs rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-150 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            {apiError && (
              <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-semibold font-kumbh text-left">
                <AlertCircle size={15} className="shrink-0" /> {apiError}
              </div>
            )}
            {(() => {
              const willDeactivate = normaliseActive(pendingToggle.is_active) === 1;
              return (
                <>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${willDeactivate ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                    {willDeactivate
                      ? <ToggleLeft  size={24} className="text-rose-600" />
                      : <ToggleRight size={24} className="text-emerald-600" />}
                  </div>
                  <h3 className={`text-lg font-semibold font-spartan ${t.cardText}`}>
                    {willDeactivate ? 'Deactivate Account?' : 'Activate Account?'}
                  </h3>
                  <p className={`text-xs font-medium font-kumbh mt-1 mb-6 ${t.subtleText}`}>
                    @{pendingToggle.username} · {pendingToggle.name}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={confirmToggle} disabled={submitting}
                      className={`w-full py-3.5 rounded-2xl text-xs font-semibold font-kumbh text-white transition-all active:scale-[0.98] disabled:opacity-60 ${
                        willDeactivate ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}>
                      {submitting
                        ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Processing…</span>
                        : 'Yes, Proceed'}
                    </button>
                    <button type="button" onClick={() => { setPendingToggle(null); setApiError(''); }} disabled={submitting}
                      className={`w-full py-2 text-xs font-semibold font-kumbh transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                      Cancel
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ════════ SUCCESS OVERLAY ════════ */}
      {successData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl">
          <div className={`w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 text-center border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
              <CheckCircle size={28} className="text-white" />
            </div>
            <h2 className={`text-xl font-semibold font-spartan ${t.cardText}`}>Account Created</h2>
            <p className={`text-xs font-bold font-kumbh mt-1 mb-6 ${t.subtleText}`}>Successfully provisioned</p>
            <div className={`rounded-2xl p-4 text-left space-y-2 mb-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              {[['Name', successData.name], ['Username', '@' + successData.username], ['Email', successData.email], ['Role', successData.role]].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className={`text-[9px] font-semibold font-kumbh ${t.subtleText}`}>{label}</span>
                  <span className={`text-xs font-bold font-kumbh ${t.cardText}`}>{value}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setSuccessData(null)}
              className={`w-full py-3.5 rounded-2xl text-xs font-semibold font-kumbh text-white active:scale-[0.98] transition-all shadow-lg bg-gradient-to-r ${t.primaryGrad} hover:opacity-90`}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccounts;

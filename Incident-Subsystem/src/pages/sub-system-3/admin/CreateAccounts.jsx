import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield, UserPlus, Search, Eye, EyeOff, CheckCircle,
  RefreshCw, ToggleLeft, ToggleRight, X, AlertCircle,
  Crown, Users, UserX, User, Loader2,
} from 'lucide-react';
import api        from '../../../services/sub-system-1/Api';
import Table      from '../../../components/sub-system-1/common/table';
import Pagination from '../../../components/sub-system-1/common/pagination';

// ── Role config ───────────────────────────────────────────────────────────────
const ROLES = [
  { value: 'admin', label: 'Admin', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'staff', label: 'Staff', color: 'bg-sky-100 text-sky-700 border-sky-200'          },
];

const getRoleStyle = (role) => {
  if (role === 'admin') return 'bg-violet-100 text-violet-700 border-violet-200';
  if (role === 'staff') return 'bg-sky-100 text-sky-700 border-sky-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const getRoleIcon = (role) => {
  if (role === 'admin') return <Crown size={9} />;
  return <User size={9} />;
};

const normaliseActive = (val) => {
  if (val === null || val === undefined || val === '' || val === false || val === 0 || val === '0') return 0;
  return 1;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const PasswordInput = ({ placeholder, value, onChange, show, className = '', disabled = false }) => (
  <input
    type={show ? 'text' : 'password'}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required
    disabled={disabled}
    className={`w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-mono text-sm transition-all disabled:opacity-50 ${className}`}
  />
);

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${color}`}>
    <div className="p-2 rounded-xl bg-white/60"><Icon size={16} className="opacity-70" /></div>
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

  // ==========================================================================
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">System Access</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Management</h1>
          </div>
          <button type="button" onClick={() => { setShowAddModal(true); setApiError(''); }}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 active:scale-95 transition-all">
            <UserPlus size={15} /> New Account
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Active"   value={staffActive.length}   icon={Users}  color="border-emerald-200 bg-emerald-50 text-emerald-800" />
          <StatCard label="Inactive" value={staffInactive.length} icon={UserX}  color="border-rose-200 bg-rose-50 text-rose-800" />
          <StatCard label="Admins"   value={totalAdmins}          icon={Crown}  color="border-violet-200 bg-violet-50 text-violet-800" />
        </div>

        {/* ── Search ── */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-5">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search name, username, or email…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 transition-all"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Active / Inactive Tabs ── */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          {TABS.map(tab => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}>
              {tab === 'active' ? <><Users size={12} /> Active</> : <><UserX size={12} /> Inactive</>}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] font-black ${
                activeTab === tab
                  ? tab === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {fetching ? '—' : tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
          {fetchError ? (
            <div className="flex items-center justify-center gap-3 py-20 bg-white text-rose-500">
              <AlertCircle size={18} /><span className="text-sm font-semibold">{fetchError}</span>
            </div>
          ) : (
            <>
              <Table headers={tableHeaders} loading={fetching} skeletonRows={6}>
                {currentItems.length === 0 && !fetching ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="py-16 text-center text-sm text-slate-400 font-medium">
                      No {activeTab} accounts found.
                    </td>
                  </tr>
                ) : currentItems.map(u => {
                  const isActive = normaliseActive(u.is_active) === 1;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">

                      {/* Identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            u.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600'
                          }`}>
                            {(u.name || u.username || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">{u.name || '—'}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              @{u.username}{u.email ? ` · ${u.email}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleStyle(u.role)}`}>
                          {getRoleIcon(u.role)} {u.role}
                        </span>
                      </td>

                      {/* Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button type="button" onClick={() => setPendingToggle(u)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-300'
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
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-200 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 active:scale-95 transition-all"
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
                <div className="bg-white border-t border-slate-100">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filtered.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ════════ ADD ACCOUNT MODAL ════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">System Access</p>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Provision Account</h2>
              </div>
              <button type="button" onClick={closeAdd} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="px-8 py-6 space-y-4">
              {apiError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-semibold">
                  <AlertCircle size={15} className="shrink-0" /> {apiError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal Full Name</label>
                <input type="text" placeholder="e.g. Juan Dela Cruz" value={form.name} required
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 text-sm font-medium transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gmail Address</label>
                  <input type="email" placeholder="name@gmail.com" value={form.email} required
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${
                      form.email && (!isGmail || isEmailTaken) ? 'border-rose-400 bg-rose-50' :
                      form.email && isGmail && !isEmailTaken  ? 'border-emerald-400 bg-emerald-50' :
                      'border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100'
                    }`} />
                  {form.email && !isGmail     && <p className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1"><AlertCircle size={9} /> Gmail only</p>}
                  {form.email && isEmailTaken && <p className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1"><AlertCircle size={9} /> Already taken</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</label>
                  <input type="text" placeholder="bgn00001" value={form.username} required
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 text-sm font-medium font-mono transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</label>
                <div className="flex gap-2">
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                        form.role === r.value ? r.color + ' shadow-sm' : 'border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}>
                      {r.value === 'admin' ? <Crown size={11} /> : <User size={11} />} {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-sky-500 hover:text-sky-700 transition-colors">
                    {showPass ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Show</>}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <PasswordInput placeholder="New password"     value={form.password}        onChange={e => setForm({ ...form, password: e.target.value })}        show={showPass} />
                  <PasswordInput placeholder="Confirm password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} show={showPass}
                    className={form.confirmPassword && !isPassMatch ? 'border-rose-400 bg-rose-50' : form.confirmPassword && isPassMatch ? 'border-emerald-400 bg-emerald-50' : ''} />
                </div>
                {form.confirmPassword && !isPassMatch && (
                  <p className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1 mt-1"><AlertCircle size={9} /> Passwords do not match</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeAdd} disabled={submitting}
                  className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={!canSave || submitting}
                  className={`flex-[2] py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-[0.98] ${
                    canSave && !submitting ? 'bg-slate-900 hover:bg-slate-800 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}>
                  {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving…</span> : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ RESET PASSWORD MODAL ════════ */}
      {resetTarget && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Account Security</p>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Reset Password</h3>
              </div>
              <button type="button" onClick={closeReset} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={16} /></button>
            </div>
            <div className="mx-7 mt-5 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border ${getRoleStyle(resetTarget.role)}`}>
                {(resetTarget.name || resetTarget.username || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{resetTarget.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">@{resetTarget.username} · <span className="capitalize">{resetTarget.role}</span></p>
              </div>
            </div>
            <form onSubmit={handleResetSubmit} className="px-7 py-5 space-y-3">
              {apiError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-semibold">
                  <AlertCircle size={15} className="shrink-0" /> {apiError}
                </div>
              )}
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
                <button type="button" onClick={() => setShowResetPass(!showResetPass)}
                  className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-sky-500 hover:text-sky-700 transition-colors">
                  {showResetPass ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Show</>}
                </button>
              </div>
              <PasswordInput placeholder="New password"         value={resetForm.pass}    onChange={e => setResetForm({ ...resetForm, pass: e.target.value })}    show={showResetPass} />
              <PasswordInput placeholder="Confirm new password" value={resetForm.confirm} onChange={e => setResetForm({ ...resetForm, confirm: e.target.value })} show={showResetPass}
                className={resetForm.confirm && resetForm.pass !== resetForm.confirm ? 'border-rose-400 bg-rose-50' : resetForm.confirm && canReset ? 'border-emerald-400 bg-emerald-50' : ''} />
              {resetForm.confirm && !canReset && (
                <p className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1"><AlertCircle size={9} /> Passwords do not match</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeReset} disabled={submitting}
                  className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={!canReset || submitting}
                  className={`flex-[2] py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-[0.98] ${
                    canReset && !submitting ? 'bg-sky-600 hover:bg-sky-700 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
          <div className="w-full max-w-xs bg-white rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-150">
            {apiError && (
              <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-semibold text-left">
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
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {willDeactivate ? 'Deactivate Account?' : 'Activate Account?'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1 mb-6">
                    @{pendingToggle.username} · {pendingToggle.name}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={confirmToggle} disabled={submitting}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-[0.98] disabled:opacity-60 ${
                        willDeactivate ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}>
                      {submitting
                        ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Processing…</span>
                        : 'Yes, Proceed'}
                    </button>
                    <button type="button" onClick={() => { setPendingToggle(null); setApiError(''); }} disabled={submitting}
                      className="w-full py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
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
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
              <CheckCircle size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Account Created</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 mb-6">Successfully provisioned</p>
            <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 mb-6 border border-slate-100">
              {[['Name', successData.name], ['Username', '@' + successData.username], ['Email', successData.email], ['Role', successData.role]].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                  <span className="text-xs font-bold text-slate-700">{value}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setSuccessData(null)}
              className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg">
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccounts;
import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../../../services/sub-system-1/Api';
import themeTokens from '../../../../Themetokens';
import { HEADERS_ACTIVE, HEADERS_INACTIVE, ITEMS_PER_PAGE } from './constants';
import { normaliseActive } from './utils';

const initialForm = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'staff',
};

const initialResetForm = { pass: '', confirm: '' };

const useCreateAccountsPage = () => {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'modern');

  useEffect(() => {
    const handler = (event) => setCurrentTheme(event.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === 'dark';

  const [staffUsers, setStaffUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchAll = useCallback(async () => {
    setFetching(true);
    setFetchError(null);

    try {
      const response = await api.get('/accounts');
      setStaffUsers((response.data || []).map((user) => ({ ...user, is_active: normaliseActive(user.is_active) })));
    } catch (error) {
      setFetchError(error.response?.data?.message || 'Failed to load accounts.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [pendingToggle, setPendingToggle] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [resetForm, setResetForm] = useState(initialResetForm);

  const staffActive = useMemo(() => staffUsers.filter((user) => normaliseActive(user.is_active) === 1), [staffUsers]);
  const staffInactive = useMemo(() => staffUsers.filter((user) => normaliseActive(user.is_active) !== 1), [staffUsers]);

  const poolForTab = useMemo(() => ({
    active: staffActive,
    inactive: staffInactive,
  }), [staffActive, staffInactive]);

  const trimmedName = form.name.trim();
  const trimmedEmail = form.email.trim();
  const trimmedUsername = form.username.trim();
  const isGmail = trimmedEmail.toLowerCase().endsWith('@gmail.com');
  const isEmailTaken = staffUsers.some((user) => user.email?.toLowerCase() === trimmedEmail.toLowerCase());
  const isUsernameTaken = staffUsers.some((user) => user.username?.toLowerCase() === trimmedUsername.toLowerCase());
  const isPassMatch = form.password !== '' && form.password === form.confirmPassword;
  const isComplete = trimmedName && trimmedUsername && trimmedEmail && form.password && form.confirmPassword;
  const canSave = isComplete && isGmail && !isEmailTaken && !isUsernameTaken && isPassMatch;
  const canReset = resetForm.pass !== '' && resetForm.pass === resetForm.confirm;

  const filtered = useMemo(() => {
    const pool = poolForTab[activeTab] || [];
    const query = searchTerm.toLowerCase();

    return pool.filter((user) => (
      !query
      || (user.name || '').toLowerCase().includes(query)
      || (user.username || '').toLowerCase().includes(query)
      || (user.email || '').toLowerCase().includes(query)
    ));
  }, [poolForTab, activeTab, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalAdmins = staffUsers.filter((user) => user.role === 'admin').length;

  const tabCounts = {
    active: staffActive.length,
    inactive: staffInactive.length,
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setApiError('');
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm(initialForm);
    setShowPass(false);
    setApiError('');
  };

  const openResetModal = (user) => {
    setResetTarget(user);
    setShowResetPass(false);
    setResetForm(initialResetForm);
    setApiError('');
  };

  const closeResetModal = () => {
    setResetTarget(null);
    setResetForm(initialResetForm);
    setShowResetPass(false);
    setApiError('');
  };

  const closeToggleModal = () => {
    setPendingToggle(null);
    setApiError('');
  };

  const handleCreate = async (event) => {
    if (event) event.preventDefault();
    if (!canSave) return;

    setSubmitting(true);
    setApiError('');

    try {
      const response = await api.post('/accounts', {
        name: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername,
        password: form.password,
        role: form.role,
      });
      const newUser = response.data.user || response.data;
      setStaffUsers((previous) => [{ ...newUser, is_active: 1 }, ...previous]);
      setShowAddModal(false);
      setSuccessData(newUser);
      setForm(initialForm);
      setShowPass(false);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (event) => {
    if (event) event.preventDefault();
    if (!canReset || !resetTarget) return;

    setSubmitting(true);
    setApiError('');

    try {
      await api.put(`/accounts/${resetTarget.id}/password`, { password: resetForm.pass });
      setResetTarget(null);
      setResetForm(initialResetForm);
      setShowResetPass(false);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;

    setSubmitting(true);
    setApiError('');

    try {
      const currentlyActive = normaliseActive(pendingToggle.is_active) === 1;
      const expectedValue = currentlyActive ? 0 : 1;
      const response = await api.put(`/accounts/${pendingToggle.id}/toggle`);
      const serverValue = response.data?.is_active != null
        ? normaliseActive(response.data.is_active)
        : expectedValue;

      setStaffUsers((previous) => previous.map((user) => (
        user.id === pendingToggle.id ? { ...user, is_active: serverValue } : user
      )));
      setPendingToggle(null);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = isDark
    ? 'border-slate-600 bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:bg-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-700'
    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100';

  const tableHeaders = activeTab === 'active' ? HEADERS_ACTIVE : HEADERS_INACTIVE;

  return {
    t,
    isDark,
    inputBase,
    currentTheme,
    fetching,
    fetchError,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    showAddModal,
    resetTarget,
    pendingToggle,
    successData,
    setSuccessData,
    showPass,
    setShowPass,
    showResetPass,
    setShowResetPass,
    submitting,
    apiError,
    form,
    setForm,
    resetForm,
    setResetForm,
    isGmail,
    isEmailTaken,
    isUsernameTaken,
    isPassMatch,
    canSave,
    canReset,
    staffActive,
    staffInactive,
    totalAdmins,
    tabCounts,
    tableHeaders,
    currentItems,
    filteredLength: filtered.length,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    openAddModal,
    closeAddModal,
    openResetModal,
    closeResetModal,
    setPendingToggle,
    closeToggleModal,
    handleCreate,
    handleResetSubmit,
    confirmToggle,
  };
};

export default useCreateAccountsPage;

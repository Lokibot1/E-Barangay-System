/**
 * Residents.jsx  —  Three-tab page: Registry | Archives | Logs
 * CHANGED: Removed the full-page `if (loading) return (...)` fallback.
 *   The page now renders immediately; ResidentStats and ResidentTable
 *   each handle their own loading state via the skeleton loader.
 *   Pagination is hidden while loading to avoid layout jumping.
 * CHANGED: Replaced alert() and custom inline error div with Toast notifications.
 * All original logic preserved.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Printer as PrinterIcon, UserPlus, Users, Archive, ScrollText, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import ResidentTable        from '../../components/sub-system-1/residents/ResidentTable';
import ResidentFilters      from '../../components/sub-system-1/residents/ResidentFilters';
import ResidentStats        from '../../components/sub-system-1/residents/ResidentStats';
import ResidentArchivesTab  from '../../components/sub-system-1/residents/subtabs/ResidentArchivesTab';
import ResidentLogsTab      from '../../components/sub-system-1/residents/subtabs/ResidentLogTab';
import Pagination           from '../../components/sub-system-1/common/pagination';
import HouseholdModal       from '../../components/sub-system-1/household/modals/householdmodal';
import EditHouseholdModal   from '../../components/sub-system-1/household/modals/EditHouseholdModal';
import Toast                from '../../components/shared/modals/Toast';

import { useResidents }      from '../../hooks/sub-system-1/useResidents';
import { usePrinter }        from '../../hooks/sub-system-1/usePrinter';
import { getResidencyLabel } from '../../utils/sub-system-1/residency';
import { householdService }  from '../../services/sub-system-1/household';
import api                   from '../../services/sub-system-1/Api';
import themeTokens           from '../../Themetokens';
import {
    canDeleteRecords,
    canManageResidents,
} from '../../homepage/services/loginService';

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
    { id: 'registry', label: 'registry', icon: Users      },
    { id: 'archives', label: 'archives', icon: Archive    },
    { id: 'logs',     label: 'logs',     icon: ScrollText },
];

const tabAccentMap = {
    modern: { text: 'text-blue-600',   bar: 'bg-blue-600',   inactive: 'text-slate-500 hover:text-slate-700' },
    blue:   { text: 'text-blue-600',   bar: 'bg-blue-600',   inactive: 'text-slate-500 hover:text-slate-700' },
    purple: { text: 'text-purple-600', bar: 'bg-purple-600', inactive: 'text-slate-500 hover:text-slate-700' },
    green:  { text: 'text-green-600',  bar: 'bg-green-600',  inactive: 'text-slate-500 hover:text-slate-700' },
    dark:   { text: 'text-slate-200',  bar: 'bg-slate-400',  inactive: 'text-slate-400 hover:text-slate-200' },
};

// ─────────────────────────────────────────────────────────────────────────────

const Residents = () => {
    const { tr } = useLanguage();
    const [currentTheme, setCurrentTheme] = useState(
        () => localStorage.getItem('appTheme') || 'modern'
    );
    const [activeTab, setActiveTab] = useState('registry');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handler = (e) => setCurrentTheme(e.detail);
        window.addEventListener('themeChange', handler);
        return () => window.removeEventListener('themeChange', handler);
    }, []);

    const t      = themeTokens[currentTheme] || themeTokens.modern;
    const isDark = currentTheme === 'dark';
    const accent = tabAccentMap[currentTheme] || tabAccentMap.modern;

    // ── Toast state ───────────────────────────────────────────────────────────
    const [toasts, setToasts] = useState([]);
    const addToast = (toast) =>
        setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
    const removeToast = (id) =>
        setToasts((prev) => prev.filter((t) => t.id !== id));

    const {
        residents,
        filteredResidents,
        loading,
        searchTerm,     setSearchTerm,
        categoryFilter, setCategoryFilter,
        handleUpdate,
        handleDelete,
        handleRestore,
    } = useResidents();

    const { printTable } = usePrinter();

    const [currentPage,     setCurrentPage]     = useState(1);
    const [purokFilter,     setPurokFilter]     = useState('All');
    const [residencyFilter, setResidencyFilter] = useState('All');
    const [openResidentRequest, setOpenResidentRequest] = useState(null);
    const itemsPerPage = 10;
    const canEditResidentRecords = canManageResidents();
    const canArchiveResidentRecords = canDeleteRecords();

    // ── Household view modal state ────────────────────────────────────────────
    const [hhModal, setHhModal] = useState({
        open: false, data: null, loading: false,
    });

    // ── Household edit modal state ────────────────────────────────────────────
    const [hhEditModal, setHhEditModal] = useState({
        open: false, data: null,
    });

    const openHouseholdModal = async (householdId) => {
        if (!householdId) return;
        setHhModal({ open: false, data: null, loading: true });
        try {
            const res = await api.get(`/households/${householdId}`);
            setHhModal({ open: true, data: res.data, loading: false });
        } catch (err) {
            console.error('Household fetch failed:', err);
            const msg = err.response?.status === 404
                ? 'Household not found.'
                : (err.response?.data?.error || 'Failed to load household.');
            setHhModal({ open: false, data: null, loading: false });
            addToast({ type: 'error', title: 'Load Failed', message: msg, duration: 4000 });
        }
    };

    const closeHouseholdModal = () =>
        setHhModal({ open: false, data: null, loading: false });

    const handleHouseholdUpdate = async (db_id, updatedData) => {
        try {
            await householdService.update(db_id, updatedData);
            // Refetch the household data to show updated info in the view modal
            const res = await api.get(`/households/${db_id}`);
            // Close edit modal first
            setHhEditModal({ open: false, data: null });
            // Update view modal with fresh data
            setHhModal({ open: true, data: res.data, loading: false });
            // Show success toast after a brief delay to ensure edit modal is closed
            setTimeout(() => {
                addToast({
                    type: 'success',
                    title: 'Household Updated',
                    message: 'Household record has been saved successfully.',
                    duration: 4000,
                });
            }, 300);
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Update Failed',
                message: err.response?.data?.message || 'Failed to update household record.',
                duration: 5000,
            });
        }
    };

    // ── Wrapped handlers that show toasts ─────────────────────────────────────
    const handleUpdateWithToast = async (updatedData) => {
        try {
            const ok = await handleUpdate(updatedData);
            if (ok) {
                addToast({
                    type: 'success',
                    title: 'Record Updated',
                    message: 'Resident profile has been saved successfully.',
                    duration: 4000,
                });
            }
            return ok;
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Update Failed',
                message: err.message || 'Failed to update resident.',
                duration: 5000,
            });
            return false;
        }
    };

    const handleDeleteWithToast = async (id) => {
        try {
            const res = await handleDelete(id);
            if (res?.success) {
                addToast({
                    type: 'success',
                    title: 'Resident Archived',
                    message: 'The resident has been moved to archives.',
                    duration: 4000,
                });
            }
            return res;
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Delete Failed',
                message: err.message || 'Failed to archive resident.',
                duration: 5000,
            });
        }
    };

    const handleRestoreWithToast = async (id) => {
        try {
            const ok = await handleRestore(id);
            if (ok) {
                addToast({
                    type: 'success',
                    title: 'Resident Restored',
                    message: 'The resident account has been reactivated.',
                    duration: 4000,
                });
            }
            return ok;
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Restore Failed',
                message: err.message || 'Failed to restore resident.',
                duration: 5000,
            });
            return false;
        }
    };

    // ── Filtering + pagination ────────────────────────────────────────────────
    const finalFiltered = useMemo(() => {
        return filteredResidents
            .map(r => ({ ...r, residency_status: getResidencyLabel(r.residency_start_date) }))
            .filter(r => {
                const matchesPurok     = purokFilter     === 'All' || String(r.temp_purok_id) === String(purokFilter);
                const matchesResidency = residencyFilter === 'All' || r.residency_status === residencyFilter;
                return matchesPurok && matchesResidency;
            });
    }, [filteredResidents, purokFilter, residencyFilter]);

    const totalPages   = Math.ceil(finalFiltered.length / itemsPerPage) || 1;
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return finalFiltered.slice(start, start + itemsPerPage);
    }, [finalFiltered, currentPage]);

    const resetAllFilters = () => {
        setSearchTerm('');
        setCategoryFilter('All');
        setPurokFilter('All');
        setResidencyFilter('All');
    };

    useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter, purokFilter, residencyFilter]);

    useEffect(() => {
        const {
            openResidentId,
            openResidentBarangayId,
            openResidentMode,
            openResidentTab,
            searchQuery: incomingSearchQuery,
        } = location.state || {};

        if (!openResidentId && !openResidentBarangayId) return;

        setActiveTab('registry');
        setCurrentPage(1);
        if (incomingSearchQuery) {
            setSearchTerm(incomingSearchQuery);
        }

        setOpenResidentRequest({
            id: openResidentId ? String(openResidentId) : '',
            barangayId: openResidentBarangayId ? String(openResidentBarangayId) : '',
            mode: openResidentMode || 'view',
            tab: openResidentTab || 'basic',
        });

        window.history.replaceState({}, '');
    }, [location.state, setSearchTerm]);

    return (
        <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>

            {/* ── TOAST ──────────────────────────────────────────────────────── */}
            <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />

            <div className="mx-auto w-full max-w-[1600px]">
                <div className="animate-in fade-in duration-500 space-y-6 pt-4 sm:pt-5">

                    {/* ── Header ── */}
                    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl space-y-2 text-left">
                            <h1 className={`text-[2.25rem] sm:text-[2.1rem] font-bold tracking-tight ${t.cardText} font-spartan`}>
                                {tr.sub1.residents}
                            </h1>
                            <p className={`max-w-2xl text-[13px] leading-6 ${t.subtleText} font-kumbh`}>
                                {tr.sub1.residentsDesc}
                            </p>
                        </div>

                        {activeTab === 'registry' && (
                            <div className="flex flex-wrap items-center gap-3">
                                {canEditResidentRecords && (
                                    <button
                                        onClick={() => navigate('/admin/residents/add')}
                                        className={`inline-flex items-center gap-2 rounded-[20px] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${t.primarySolid} ${t.primaryHover}`}
                                    >
                                        <UserPlus size={16} /> {tr.sub1.addResident}
                                    </button>
                                )}
                                <button
                                    onClick={() => printTable(
                                        'Resident Masterlist',
                                        [
                                            { header: '#',         key: 'no',               width: '5%',  align: 'center' },
                                            { header: 'Full Name', key: 'name',             width: '25%' },
                                            { header: 'Age',       key: 'age',              width: '8%',  align: 'center' },
                                            { header: 'Purok',     key: 'resolved_purok',   width: '12%' },
                                            { header: 'Address',   key: 'full_address',     width: '25%' },
                                            { header: 'Residency', key: 'residency_status', width: '15%' },
                                        ],
                                        finalFiltered,
                                        `Purok: ${purokFilter} | Sector: ${categoryFilter} | Status: ${residencyFilter}`
                                    )}
                                    className={`inline-flex items-center gap-2 rounded-[20px] px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${
                                        isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 hover:bg-slate-900'
                                    }`}
                                >
                                    <PrinterIcon size={15} /> {tr.sub1.export}
                                </button>
                            </div>
                        )}
                    </section>

                    {/* ── Stats — skeleton shown while loading ── */}
                    {activeTab === 'registry' && (
                        <ResidentStats
                            residents={residents}
                            loading={loading}
                            t={t}
                            currentTheme={currentTheme}
                        />
                    )}

                    {/* ── Main card ── */}
                    <div className={`${t.cardBg} border ${t.cardBorder} overflow-hidden rounded-[30px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex flex-col`}>

                        {/* Tab bar */}
                        <div className={`flex border-b ${t.cardBorder} ${isDark ? 'bg-slate-900/60' : 'bg-slate-50/80'} px-6`}>
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                                        activeTab === id ? accent.text : accent.inactive
                                    }`}
                                >
                                    <Icon size={14} /> {tr.sub1[label] || label}
                                    {activeTab === id && (
                                        <div className={`absolute bottom-0 left-0 w-full h-0.5 ${accent.bar}`} />
                                    )}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'registry' && (
                            <>
                                <ResidentFilters
                                    searchTerm={searchTerm}           setSearchTerm={setSearchTerm}
                                    categoryFilter={categoryFilter}   setCategoryFilter={setCategoryFilter}
                                    purokFilter={purokFilter}         setPurokFilter={setPurokFilter}
                                    residencyFilter={residencyFilter} setResidencyFilter={setResidencyFilter}
                                    totalResults={finalFiltered.length}
                                    resetAllFilters={resetAllFilters}
                                    t={t} currentTheme={currentTheme}
                                />
                                <div className="overflow-x-auto">
                                    <ResidentTable
                                        residents={currentItems}
                                        loading={loading}
                                        onUpdate={handleUpdateWithToast}
                                        onDelete={handleDeleteWithToast}
                                        onHouseholdClick={openHouseholdModal}
                                        canEdit={canEditResidentRecords}
                                        canDelete={canArchiveResidentRecords}
                                        externalOpenRequest={openResidentRequest}
                                        onExternalOpenHandled={() => setOpenResidentRequest(null)}
                                        t={t}
                                        currentTheme={currentTheme}
                                    />
                                </div>
                                {!loading && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={finalFiltered.length}
                                        itemsPerPage={itemsPerPage}
                                        t={t} currentTheme={currentTheme}
                                    />
                                )}
                            </>
                        )}

                        {activeTab === 'archives' && (
                            <ResidentArchivesTab
                                t={t}
                                currentTheme={currentTheme}
                                onRestore={handleRestoreWithToast}
                            />
                        )}

                        {activeTab === 'logs' && (
                            <ResidentLogsTab t={t} currentTheme={currentTheme} />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Loading overlay (household fetch) ── */}
            {hhModal.loading && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <Loader2 size={18} className="animate-spin text-slate-400" />
                        <span className="text-sm font-kumbh font-black uppercase tracking-widest text-slate-400">
                            Loading household…
                        </span>
                    </div>
                </div>
            )}

            {/* ── Household view modal ── */}
            {hhModal.open && hhModal.data && (
                <HouseholdModal
                    isOpen={hhModal.open}
                    data={hhModal.data}
                    t={t}
                    currentTheme={currentTheme}
                    onClose={closeHouseholdModal}
                    onEdit={(h) => {
                        closeHouseholdModal();
                        setHhEditModal({ open: true, data: h });
                    }}
                />
            )}

            {/* ── Household edit modal ── */}
            {hhEditModal.open && hhEditModal.data && (
                <EditHouseholdModal
                    isOpen={hhEditModal.open}
                    data={hhEditModal.data}
                    onUpdate={handleHouseholdUpdate}
                    t={t}
                    onClose={() => setHhEditModal({ open: false, data: null })}
                />
            )}
        </div>
    );
};

export default Residents;

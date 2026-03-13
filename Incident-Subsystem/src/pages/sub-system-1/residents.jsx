/**
 * Residents.jsx  —  Three-tab page: Registry | Archives | Logs
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Printer as PrinterIcon, UserPlus, Users, Archive, ScrollText, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ResidentTable        from '../../components/sub-system-1/residents/ResidentTable';
import ResidentFilters      from '../../components/sub-system-1/residents/ResidentFilters';
import ResidentStats        from '../../components/sub-system-1/residents/ResidentStats';
import ResidentArchivesTab  from '../../components/sub-system-1/residents/subtabs/ResidentArchivesTab';
import ResidentLogsTab      from '../../components/sub-system-1/residents/subtabs/ResidentLogTab';
import Pagination           from '../../components/sub-system-1/common/pagination';
import HouseholdModal       from '../../components/sub-system-1/household/modals/householdmodal';
import EditHouseholdModal   from '../../components/sub-system-1/household/modals/EditHouseholdModal';

import { useResidents }      from '../../hooks/sub-system-1/useResidents';
import { usePrinter }        from '../../hooks/sub-system-1/usePrinter';
import { getResidencyLabel } from '../../utils/sub-system-1/residency';
import { householdService }  from '../../services/sub-system-1/household';
import api                   from '../../services/sub-system-1/Api';
import themeTokens           from '../../Themetokens';

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
    { id: 'registry', label: 'Registry',  icon: Users      },
    { id: 'archives', label: 'Archives',  icon: Archive    },
    { id: 'logs',     label: 'Logs', icon: ScrollText },
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
    const [currentTheme, setCurrentTheme] = useState(
        () => localStorage.getItem('appTheme') || 'modern'
    );
    const [activeTab, setActiveTab] = useState('registry');
    const navigate = useNavigate();

    useEffect(() => {
        const handler = (e) => setCurrentTheme(e.detail);
        window.addEventListener('themeChange', handler);
        return () => window.removeEventListener('themeChange', handler);
    }, []);

    const t      = themeTokens[currentTheme] || themeTokens.modern;
    const isDark = currentTheme === 'dark';
    const accent = tabAccentMap[currentTheme] || tabAccentMap.modern;

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
    const itemsPerPage = 10;

    // ── Household view modal state ────────────────────────────────────────────
    const [hhModal, setHhModal] = useState({
        open: false, data: null, loading: false, error: null,
    });

    // ── Household edit modal state ────────────────────────────────────────────
    const [hhEditModal, setHhEditModal] = useState({
        open: false, data: null,
    });

    const openHouseholdModal = async (householdId) => {
        if (!householdId) return;
        setHhModal({ open: false, data: null, loading: true, error: null });
        try {
            const res = await api.get(`/households/${householdId}`);
            setHhModal({ open: true, data: res.data, loading: false, error: null });
        } catch (err) {
            console.error('Household fetch failed:', err);
            const msg = err.response?.status === 404
                ? 'Household not found.'
                : (err.response?.data?.error || 'Failed to load household.');
            setHhModal({ open: false, data: null, loading: false, error: msg });
            setTimeout(() => setHhModal(prev => ({ ...prev, error: null })), 4000);
        }
    };

    const closeHouseholdModal = () =>
        setHhModal({ open: false, data: null, loading: false, error: null });

    // ── Household update handler (used by EditHouseholdModal) ─────────────────
    const handleHouseholdUpdate = async (db_id, updatedData) => {
        try {
            await householdService.update(db_id, updatedData);
            setHhEditModal({ open: false, data: null });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update household record.');
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

    if (loading) return (
        <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>
            <div className="mx-auto flex h-64 w-full max-w-[1600px] items-center justify-center">
                <div className={`animate-pulse font-semibold font-kumbh ${t.subtleText}`}>Syncing records...</div>
            </div>
        </div>
    );

    return (
        <div className={`font-sans min-h-screen py-4 pb-24 px-3 sm:px-4 lg:px-5 relative ${t.pageBg}`}>
            <div className="mx-auto w-full max-w-[1600px]">
                <div className="animate-in fade-in duration-500 space-y-6 pt-4 sm:pt-5">

                    {/* ── Header ── */}
                    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl space-y-2 text-left">
                            <h1 className={`text-[2.25rem] sm:text-[2.1rem] font-bold tracking-tight ${t.cardText} font-spartan`}>
                                Resident Index
                            </h1>
                            <p className={`max-w-2xl text-[13px] leading-6 ${t.subtleText} font-kumbh`}>
                                Maintain the official masterlist, manage archived records, and review edit history from one organized workspace.
                            </p>
                        </div>

                        {activeTab === 'registry' && (
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => navigate('/admin/residents/add')}
                                    className={`inline-flex items-center gap-2 rounded-[20px] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${t.primarySolid} ${t.primaryHover}`}
                                >
                                    <UserPlus size={16} /> Add Resident
                                </button>
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
                                    <PrinterIcon size={15} /> Export Masterlist
                                </button>
                            </div>
                        )}
                    </section>

                    {/* ── Stats ── */}
                    {activeTab === 'registry' && (
                        <ResidentStats residents={residents} t={t} currentTheme={currentTheme} />
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
                                    <Icon size={14} /> {label}
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
                                        onUpdate={handleUpdate}
                                        onDelete={handleDelete}
                                        onHouseholdClick={openHouseholdModal}
                                        t={t}
                                        currentTheme={currentTheme}
                                    />
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={finalFiltered.length}
                                    itemsPerPage={itemsPerPage}
                                    t={t} currentTheme={currentTheme}
                                />
                            </>
                        )}

                        {activeTab === 'archives' && (
                            <ResidentArchivesTab
                                t={t}
                                currentTheme={currentTheme}
                                onRestore={handleRestore}
                            />
                        )}

                        {activeTab === 'logs' && (
                            <ResidentLogsTab t={t} currentTheme={currentTheme} />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Error toast (auto-clears after 4s) ── */}
            {hhModal.error && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-rose-600 text-white text-sm font-semibold font-kumbh">
                    <AlertCircle size={16} className="shrink-0" />
                    {hhModal.error}
                </div>
            )}

            {/* ── Loading overlay ── */}
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
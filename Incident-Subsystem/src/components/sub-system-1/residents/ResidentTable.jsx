import React, { useCallback, useEffect, useState } from 'react';
import ResidentRow from './ResidentRow';
import ResidentDetailsModal from './ResidentDetailsModal';
import ModalWrapper from '../common/ModalWrapper'; 
import { residentService } from '../../../services/sub-system-1/residents';
import SkeletonLoader from '../common/SkeletonLoader';
import { AlertTriangle, Loader2, UserMinus } from 'lucide-react';

// Keep fetched resident details in memory for the current SPA session only.
// This resets on a full browser refresh, which matches the desired loader behavior.
const residentDetailsCache = new Map();

const getResidentCacheKey = (resident) => {
    if (!resident?.id && resident?.id !== 0) return '';
    return String(resident.id);
};

const setCachedResidentDetails = (resident) => {
    const cacheKey = getResidentCacheKey(resident);
    if (!cacheKey || !resident) return;
    residentDetailsCache.set(cacheKey, resident);
};

const ResidentTable = ({
    residents,
    loading = false,
    onUpdate,
    onDelete,
    onHouseholdClick,
    canEdit = true,
    canDelete = true,
    externalOpenRequest = null,
    onExternalOpenHandled,
    t,
    currentTheme = 'modern',
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [modalMode, setModalMode] = useState('view');
    const [modalInitialTab, setModalInitialTab] = useState('basic');
    const [openingResident, setOpeningResident] = useState({
        loading: false,
        residentId: null,
        mode: 'view',
    });

    // State for Deactivation Confirmation
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const isDark = currentTheme === 'dark';
    const headers = ['Name', 'Age', 'Address', 'Purok', 'Sector', 'Actions'];
    const COLS = headers.length;

    const openModal = useCallback(async (r, mode, initialTab = 'basic') => {
        if (openingResident.loading) return;

        const cacheKey = getResidentCacheKey(r);
        const cachedResident = cacheKey ? residentDetailsCache.get(cacheKey) : null;

        setOpeningResident({
            loading: !cachedResident,
            residentId: !cachedResident ? (r?.id ?? null) : null,
            mode,
        });
        setModalMode(mode);
        setModalInitialTab(initialTab);

        if (cachedResident) {
            setSelectedResident(cachedResident);
            setIsModalOpen(true);

            residentService.getResident(r.id)
                .then((fresh) => {
                    if (!fresh) return;
                    setCachedResidentDetails(fresh);
                    setSelectedResident((current) =>
                        String(current?.id) === String(r.id) ? fresh : current,
                    );
                })
                .catch(() => {});

            return;
        }

        try {
            const fresh = await residentService.getResident(r.id);
            setSelectedResident(fresh);
            setCachedResidentDetails(fresh);
        } catch {
            setSelectedResident(r);
            setCachedResidentDetails(r);
        } finally {
            setOpeningResident({
                loading: false,
                residentId: null,
                mode: 'view',
            });
        }
        setIsModalOpen(true);
    }, [openingResident.loading]);

    const handleView = (r) => openModal(r, 'view');
    const handleEdit = (r) => openModal(r, 'edit');

    // Trigger deactivation confirmation
    const handleDeleteClick = (r) => {
        if (!canDelete) return;
        setSelectedResident(r);
        setIsConfirmOpen(true);
    };

    const handleConfirmDeactivate = async () => {
        if (!selectedResident) return;
        setIsDeactivating(true);
        try {
            await onDelete(selectedResident.id); 
            setIsConfirmOpen(false);
            setIsModalOpen(false); // Close details modal if it was open
        } catch (err) {
            console.error('Deactivation failed:', err);
        } finally {
            setIsDeactivating(false);
            setSelectedResident(null);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedResident(null), 300);
    };

    const handleSave = async (updatedData) => {
        const ok = await onUpdate(updatedData);
        if (ok) {
            try {
                const fresh = await residentService.getResident(updatedData.id);
                setSelectedResident(fresh);
                setCachedResidentDetails(fresh);
            } catch {
                const mergedResident = { ...(selectedResident || {}), ...updatedData };
                setSelectedResident(mergedResident);
                setCachedResidentDetails(mergedResident);
            }
            return true;
        }
        return false;
    };

    useEffect(() => {
        if (
            (!externalOpenRequest?.id && !externalOpenRequest?.barangayId) ||
            loading ||
            !Array.isArray(residents) ||
            residents.length === 0
        ) {
            return;
        }

        const matchedResident = residents.find(
            (resident) =>
                (externalOpenRequest.id &&
                    String(resident.id) === String(externalOpenRequest.id)) ||
                (externalOpenRequest.barangayId &&
                    [
                        resident?.barangay_id,
                        resident?.trackingNumber,
                        resident?.barangayId,
                    ]
                        .filter(Boolean)
                        .some(
                            (value) =>
                                String(value) ===
                                String(externalOpenRequest.barangayId),
                        )),
        );

        if (!matchedResident) return;

        openModal(
            matchedResident,
            externalOpenRequest.mode || 'view',
            externalOpenRequest.tab || 'basic',
        );
        onExternalOpenHandled?.();
    }, [externalOpenRequest, loading, onExternalOpenHandled, openModal, residents]);

    return (
        <>
            <div className="w-full overflow-x-auto">
                <table className="min-w-[1100px] w-full border-separate border-spacing-0">
                    <colgroup>
                        <col style={{ width: '26%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '26%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '10%' }} />
                    </colgroup>
                    <thead className={`${isDark ? 'bg-slate-900/80' : 'bg-slate-50/80'} backdrop-blur-sm`}>
                        <tr>
                            {headers.map((h) => (
                                <th key={h} className={`border-b px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] ${h === 'Age' || h === 'Actions' ? 'text-center' : 'text-left'} ${t.subtleText} ${t.cardBorder} font-spartan`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={t.cardBg}>
                        {loading ? (
                            <SkeletonLoader variant="table" rows={8} cols={COLS} isDark={isDark} />
                        ) : residents?.length > 0 ? (
                            residents.map((r) => (
                                <ResidentRow
                                    key={r.id}
                                    r={r}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={() => handleDeleteClick(r)}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                    onHouseholdClick={onHouseholdClick}
                                    actionLoadingId={openingResident.residentId}
                                    actionLoadingMode={openingResident.mode}
                                    disableActions={openingResident.loading}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={COLS} className="px-6 py-32 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-full text-slate-300">
                                            <UserMinus size={48} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className={`text-lg font-black font-spartan uppercase ${t.cardText}`}>No residents found</p>
                                            <p className={`text-xs font-medium font-kumbh ${t.subtleText}`}>Adjust your filters or search criteria.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Main Resident Details / Edit Modal */}
            {isModalOpen && selectedResident && (
                <ResidentDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleClose}
                    resident={selectedResident}
                    mode={modalMode}
                    initialTab={modalInitialTab}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    t={t}
                    currentTheme={currentTheme}
                    onSave={handleSave}
                    onDelete={canDelete ? () => handleDeleteClick(selectedResident) : undefined}
                />
            )}

            {openingResident.loading && (
                <div
                    className={`fixed inset-0 z-[9998] flex items-center justify-center backdrop-blur-[6px] ${
                        isDark ? 'bg-slate-900/55' : 'bg-[rgba(239,246,255,0.72)]'
                    }`}
                >
                    <div className="flex flex-col items-center gap-4 px-6 py-6 text-center">
                        <div
                            className={`relative h-16 w-16 rounded-full border ${
                                isDark ? 'border-slate-600/80' : 'border-slate-300/90'
                            }`}
                        >
                            <div
                                className={`absolute inset-0 animate-spin rounded-full border-2 border-transparent ${
                                    isDark
                                        ? 'border-t-emerald-300 border-r-emerald-300'
                                        : 'border-t-blue-600 border-r-emerald-500'
                                }`}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <p
                                className={`text-[11px] font-spartan font-bold uppercase tracking-[0.28em] ${
                                    isDark ? 'text-slate-100' : 'text-slate-700'
                                }`}
                            >
                                Please wait
                            </p>
                            <p
                                className={`text-[13px] font-kumbh ${
                                    isDark ? 'text-slate-300' : 'text-slate-500'
                                }`}
                            >
                                {openingResident.mode === 'edit'
                                    ? 'Opening edit form...'
                                    : 'Opening resident profile...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CUSTOM DEACTIVATE CONFIRMATION MODAL ── */}
            {isConfirmOpen && (
                <ModalWrapper 
                    isOpen={isConfirmOpen} 
                    onClose={() => !isDeactivating && setIsConfirmOpen(false)} 
                    title="ARCHIVE RESIDENT"
                    maxWidth="max-w-md"
                    t={t}
                >
                    <div className="space-y-6 text-center py-2">
                        <div className="mx-auto w-20 h-20 bg-rose-500/10 border-2 border-dashed border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 animate-pulse">
                            <AlertTriangle size={36} />
                        </div>
                        
                        <div className="space-y-2 px-2">
                            <h3 className={`text-xl font-black font-spartan uppercase tracking-tight ${t.cardText}`}>
                                Confirm Deactivation
                            </h3>
                            <p className={`text-[13px] font-medium font-kumbh ${t.subtleText} leading-relaxed`}>
                                You are about to archive <span className="font-black text-rose-500">{selectedResident?.first_name} {selectedResident?.last_name}</span>. 
                                Their access to the **Resident Portal** will be immediately revoked.
                            </p>
                        </div>

                     
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                onClick={handleConfirmDeactivate}
                                disabled={isDeactivating}
                                className="order-1 sm:order-2 flex-[1.5] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-rose-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-900/10 disabled:opacity-50"
                            >
                                {isDeactivating ? <Loader2 className="animate-spin" size={14} /> : null}
                                {isDeactivating ? 'Archiving...' : 'Yes, Archive Resident'}
                            </button>
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                disabled={isDeactivating}
                                className={`order-2 sm:order-1 flex-1 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border-2 ${t.cardBorder} ${t.cardText} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-30`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}
        </>
    );
};

export default ResidentTable;

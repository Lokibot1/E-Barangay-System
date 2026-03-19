import React, { useState } from 'react';
import ResidentRow from './ResidentRow';
import ResidentDetailsModal from './ResidentDetailsModal';
import ModalWrapper from '../common/ModalWrapper'; 
import { residentService } from '../../../services/sub-system-1/residents';
import SkeletonLoader from '../common/SkeletonLoader';
import { AlertTriangle, Loader2, UserMinus } from 'lucide-react';

const ResidentTable = ({ residents, loading = false, onUpdate, onDelete, onHouseholdClick, t, currentTheme = 'modern' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [modalMode, setModalMode] = useState('view');

    // State for Deactivation Confirmation
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const isDark = currentTheme === 'dark';
    const headers = ['Name', 'Age', 'Address', 'Purok', 'Sector', 'Actions'];
    const COLS = headers.length;

    const openModal = async (r, mode) => {
        setModalMode(mode);
        try {
            const fresh = await residentService.getResident(r.id);
            setSelectedResident(fresh);
        } catch {
            setSelectedResident(r);
        }
        setIsModalOpen(true);
    };

    const handleView = (r) => openModal(r, 'view');
    const handleEdit = (r) => openModal(r, 'edit');

    // Trigger deactivation confirmation
    const handleDeleteClick = (r) => {
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
            } catch {
                setSelectedResident(prev => ({ ...prev, ...updatedData }));
            }
            return true;
        }
        return false;
    };

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
                                    onHouseholdClick={onHouseholdClick}
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
                    t={t}
                    currentTheme={currentTheme}
                    onSave={handleSave}
                    onDelete={() => handleDeleteClick(selectedResident)}
                />
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
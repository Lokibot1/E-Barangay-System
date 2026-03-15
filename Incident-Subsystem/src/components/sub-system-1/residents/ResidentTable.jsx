/**
 * ResidentTable.jsx
 * ADDED: loading prop — renders TableSkeleton inside tbody when true.
 * All original logic preserved.
 */

import React, { useState } from 'react';
import ResidentRow          from './ResidentRow';
import ResidentDetailsModal from './ResidentDetailsModal';
import { residentService }  from '../../../services/sub-system-1/residents';
import SkeletonLoader from '../common/SkeletonLoader';

const ResidentTable = ({ residents, loading = false, onUpdate, onDelete, onHouseholdClick, t, currentTheme = 'modern' }) => {
    const [isModalOpen,      setIsModalOpen]      = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [modalMode,        setModalMode]        = useState('view');

    const isDark  = currentTheme === 'dark';
    const headers = ['Name', 'Age', 'Address', 'Purok', 'Sector', 'Actions'];
    const COLS    = headers.length;

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

    const handleView   = (r) => openModal(r, 'view');
    const handleEdit   = (r) => openModal(r, 'edit');

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This will also deactivate their account.`)) {
            try { await onDelete(id); } catch (err) { console.error('Delete failed:', err); }
        }
    };

    // Called from modal — confirm already done inside modal
    const handleDeleteFromModal = async (id, name) => {
        try { await onDelete(id); } catch (err) { console.error('Delete from modal failed:', err); }
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
                                <th key={h} className={`border-b px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] ${h === 'Age' || h === 'Actions' ? 'text-center' : 'text-left'} ${t.subtleText} ${t.cardBorder} font-kumbh`}>
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
                                    onDelete={handleDelete}
                                    onHouseholdClick={onHouseholdClick}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={COLS} className="px-6 py-28 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <span className={`text-2xl font-bold ${t.cardText} font-spartan`}>No resident records found</span>
                                        <p className={`max-w-md text-sm leading-7 ${t.subtleText} font-medium font-kumbh`}>Try adjusting the current filters or search input to surface the residents you need.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedResident && (
                <ResidentDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleClose}
                    resident={selectedResident}
                    mode={modalMode}
                    t={t}
                    currentTheme={currentTheme}
                    onSave={handleSave}
                    onDelete={handleDeleteFromModal}
                />
            )}
        </>
    );
};

export default ResidentTable;
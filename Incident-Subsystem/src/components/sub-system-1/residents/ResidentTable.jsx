import React, { useState } from 'react';
import ResidentRow from './ResidentRow';
import ResidentDetailsModal from './ResidentDetailsModal';

const ResidentTable = ({ residents, onUpdate, onDelete, t, currentTheme = 'modern' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [modalMode, setModalMode] = useState('view');

    const isDark = currentTheme === 'dark';
    const headers = ["Name", "Age", "Address", "Purok", "Sector", "Actions"];

    const handleView = (resident) => {
        setSelectedResident(resident);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEdit = (resident) => {
        setSelectedResident(resident);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        // Tip: Standard confirm. If you use SweetAlert2 later, replace this part.
        if (window.confirm(`Are you sure you want to delete ${name}? This will also deactivate their account.`)) {
            try {
                await onDelete(id);
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedResident(null);
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
                            {headers.map((header) => {
                                const lower = header.toLowerCase();
                                const isCentered = lower === 'age' || lower === 'actions';

                                return (
                                    <th
                                        key={header}
                                        className={`border-b px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] ${isCentered ? 'text-center' : 'text-left'} ${t.subtleText} ${t.cardBorder} font-kumbh`}
                                    >
                                        {header}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody className={t.cardBg}>
                        {residents && residents.length > 0 ? (
                            residents.map((r) => (
                                <ResidentRow
                                    key={r.id}
                                    r={r}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    t={t}
                                    currentTheme={currentTheme}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-28 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <span className={`text-2xl font-bold ${t.cardText} font-spartan`}>
                                            No resident records found
                                        </span>
                                        <p className={`max-w-md text-sm leading-7 ${t.subtleText} font-medium font-kumbh`}>
                                            Try adjusting the current filters or search input to surface the residents you need.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL COMPONENT */}
            {isModalOpen && selectedResident && (
                <ResidentDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    resident={selectedResident}
                    mode={modalMode}
                    t={t}
                    currentTheme={currentTheme}
                    onSave={async (updatedData) => {
                    
                        const success = await onUpdate(updatedData);
                        if (success) {
             
                            handleCloseModal();
                            return true;
                        }
                        return false;
                    }}
                />
            )}
        </>
    );
};

export default ResidentTable;

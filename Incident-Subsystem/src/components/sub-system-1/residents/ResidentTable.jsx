import React, { useState } from 'react';
import Table from '../common/table';
import ResidentRow from './ResidentRow';
import ResidentDetailsModal from './ResidentDetailsModal';

const ResidentTable = ({ residents, onUpdate, onDelete, t }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [modalMode, setModalMode] = useState('view');

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
            <Table headers={headers} t={t}>
                {residents && residents.length > 0 ? (
                    residents.map((r) => (
                        <ResidentRow
                            key={r.id}
                            r={r}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            t={t}
                        />
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className={`px-6 py-24 text-center text-lg font-black ${t.subtleText} uppercase tracking-widest`}>
                            No records found.
                        </td>
                    </tr>
                )}
            </Table>

            {/* MODAL COMPONENT */}
            {isModalOpen && selectedResident && (
                <ResidentDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    resident={selectedResident}
                    mode={modalMode}
                    t={t}
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
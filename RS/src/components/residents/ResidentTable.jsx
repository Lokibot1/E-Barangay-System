import React, { useState } from 'react';
import Table from '../common/table';
import ResidentRow from './ResidentRow';
import ResidentDetailsModal from './ResidentDetailsModal';

const ResidentTable = ({ residents, onUpdate, onDelete }) => {
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
    if (window.confirm(`Are you sure you want to delete ${name}? This will also deactivate their account.`)) {
      try {
        await onDelete(id);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  return (
    <>
      <Table headers={headers}>
        {residents.length > 0 ? (
          residents.map((r) => (
            <ResidentRow 
              key={r.id} 
              r={r} 
              onView={handleView} 
              onEdit={handleEdit} 
              onDelete={() => handleDelete(r.id, r.name)} 
            />
          ))
        ) : (
          <tr>
            <td colSpan={6} className="px-6 py-24 text-center text-lg font-black text-slate-400 uppercase tracking-widest">
              No records found.
            </td>
          </tr>
        )}
      </Table>


      {isModalOpen && (
        <ResidentDetailsModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          resident={selectedResident}
          mode={modalMode}
          onSave={async (data) => {
            const success = await onUpdate(data);
            if (success) {
              setIsModalOpen(false);
            }
          }}
        />
      )}
    </>
  );
};

export default ResidentTable;
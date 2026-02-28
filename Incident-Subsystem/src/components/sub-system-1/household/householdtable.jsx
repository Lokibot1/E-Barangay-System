import React from 'react';
import Table from '../common/table';
import HouseholdRow from './householdrow';

const HouseholdTable = ({ households, onView, onDelete }) => {
  const headers = ["ID", "Head of Family", "Location", "Tenure", "Wall Type", "Members", "Action"];

  return (
    <Table headers={headers}>
      {households.length > 0 ? (
        households.map((h) => (
          <HouseholdRow 
            key={h.id} 
            item={h} 
            onView={onView} 
            onDelete={onDelete} 
          />
        ))
      ) : (
        <tr>
          {/* Used colSpan={6} to cover the entire table width */}
          <td colSpan={6} className="px-6 py-24 text-center text-lg font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            No record found.
          </td>
        </tr>
      )}
    </Table>
  );
};

export default HouseholdTable;
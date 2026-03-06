import React from 'react';
import Table from '../common/table';
import HouseholdRow from './householdrow';

const HouseholdTable = ({ households, onView, onEdit, t }) => { // Added onEdit prop here

  const headers = [
    "Household Head & ID", 
    "Location", 
    "Classification", 
    "Members", 
    "Action" 
  ];

  return (
    <Table headers={headers} t={t}>
      {households && households.length > 0 ? (
        households.map((h) => (
          <HouseholdRow
            key={h.db_id || h.id}
            item={h}
            onView={onView}
            onEdit={onEdit} // Passed onEdit to the row
            t={t}
          />
        ))
      ) : (
        <tr>
          <td colSpan={5} className={`px-6 py-32 text-center text-sm font-black ${t.subtleText} uppercase tracking-[0.2em]`}>
            No household records found
          </td>
        </tr>
      )}
    </Table>
  );
};

export default HouseholdTable;
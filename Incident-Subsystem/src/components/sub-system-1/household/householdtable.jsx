import React from 'react';
import Table from '../common/table';
import HouseholdRow from './householdrow';

const HouseholdTable = ({ households, onView, onDelete, t }) => {
  const headers = ["ID", "Head of Family", "Location", "Tenure", "Wall Type", "Members", "Action"];

  return (
    <Table headers={headers} t={t}>
      {households.length > 0 ? (
        households.map((h) => (
          <HouseholdRow
            key={h.id}
            item={h}
            onView={onView}
            onDelete={onDelete}
            t={t}
          />
        ))
      ) : (
        <tr>
          <td colSpan={6} className="px-6 py-24 text-center text-lg font-black text-slate-400 uppercase tracking-widest">
            No record found.
          </td>
        </tr>
      )}
    </Table>
  );
};

export default HouseholdTable;

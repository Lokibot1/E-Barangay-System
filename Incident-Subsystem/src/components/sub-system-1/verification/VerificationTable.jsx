import React from 'react';
import Table from '../common/table';
import VerificationRow from './VerificationRow';

const PendingVerificationTable = ({ data, onReview }) => {
  // Headers order: Name, Age, Address, Purok, Submitted, Status, Actions
  const headers = ["Name", "Age", "Address", "Purok", "Submitted", "Status", "Actions"];

  return (
    <div className="w-full overflow-x-auto">
      <Table headers={headers}>
        {data && data.length > 0 ? (
          data.map((res, index) => (
            <VerificationRow 
              key={res.id || index} 
              res={res} 
              onReview={onReview} 
            />
          ))
        ) : (
          <tr>
            <td colSpan={7} className="px-6 py-24 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-lg font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                  No records found
                </span>
                <p className="text-xs text-slate-400 font-bold uppercase">Try adjusting your filters or search term</p>
              </div>
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
};

export default PendingVerificationTable;
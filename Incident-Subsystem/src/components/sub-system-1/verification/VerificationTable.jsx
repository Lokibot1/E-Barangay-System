import React from 'react';
import Table from '../common/table'; 
import VerificationRow from './VerificationRow';

const PendingVerificationTable = ({ data, onReview, t }) => {
  const headerLabels = ["Name", "Age", "Address", "Purok", "Submitted", "Status", "Action"];

  return (
    <div className="w-full">
      <Table headers={headerLabels} t={t}>
        {data && data.length > 0 ? (
          data.map((res, index) => (
            <VerificationRow
              key={res.id || index}
              res={res}
              onReview={onReview}
              t={t}
            />
          ))
        ) : (
          <tr>
            <td colSpan={7} className="px-6 py-32 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <span className={`text-xl font-black ${t.subtleText} uppercase tracking-[0.3em] font-spartan`}>
                  No Pending Verifications
                </span>
                <p className={`text-xs ${t.subtleText} font-bold uppercase font-kumbh opacity-70`}>
                  Everything is up to date.
                </p>
              </div>
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
};

export default PendingVerificationTable;
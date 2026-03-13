import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import ModalWrapper from '../../common/ModalWrapper';

/**
 * Confirmation modal shown before soft-deleting a household.
 * Warns the user that all residents in the household will also be marked inactive.
 */
const DeactivateHouseholdModal = ({
  isOpen,
  onClose,
  onConfirm,
  household,
  loading = false,
  t,
  currentTheme = 'modern',
}) => {
  if (!household) return null;

  const head = household.head || 'Unknown Head';
  const householdId = household.id || '—';
  const memberCount = household.members ?? 0;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Mark household as moved out"
      maxWidth="max-w-md"
      t={t}
    >
      <div className="space-y-5">
        {/* Warning banner */}
        <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-4">
          <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-700 font-kumbh">
              This action cannot be undone from the registry.
            </p>
            <p className="mt-1 text-xs text-rose-500 font-kumbh leading-relaxed">
              The household record and all {memberCount} linked resident
              {memberCount !== 1 ? 's' : ''} will be marked as <strong>inactive</strong> and
              removed from the active registry. Use this only when the entire household has
              permanently left the barangay.
            </p>
          </div>
        </div>

        {/* Household summary */}
        <div className={`rounded-2xl border ${t.cardBorder} ${t.inlineBg} px-4 py-4 space-y-1`}>
          <p className={`text-xs font-medium text-slate-400 font-kumbh`}>Household to deactivate</p>
          <p className={`text-base font-bold ${t.cardText} font-spartan`}>{head}</p>
          <p className={`text-xs font-medium ${t.subtleText} font-kumbh`}>
            {householdId} · {memberCount} member{memberCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-6 py-3 rounded-xl text-sm font-semibold border ${t.cardBorder} ${t.cardText} hover:opacity-70 transition-all font-kumbh disabled:opacity-40`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-lg font-kumbh disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm & Deactivate'
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default DeactivateHouseholdModal;
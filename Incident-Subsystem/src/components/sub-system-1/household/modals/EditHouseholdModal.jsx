import React, { useState, useEffect, useMemo } from 'react';
import ModalWrapper from '../../common/ModalWrapper';
import Button from '../../common/Button'; 
import api from '../../../../services/sub-system-1/Api';

const EditHouseholdModal = ({ isOpen, onClose, data, onUpdate, t }) => {
  const [formData, setFormData] = useState({
    db_id: '',           // Numeric Primary Key (e.g. 1)
    household_id: '',    // Formatted Business ID (e.g. HH-2024-001)
    head_resident_id: '',
    house_number: '',
    purok_id: '',
    street_id: '',
    tenure_status: '',
    is_indigent: 0,
    wall_material: '',
    roof_material: '',
    num_families_reported: 1,
  });

  const [references, setReferences] = useState({ 
    puroks: [], streets: [], wall_options: [], roof_options: [], tenure_options: [] 
  });
  
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [isAddressTaken, setIsAddressTaken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // 1. FETCH REFERENCES
  useEffect(() => {
    if (isOpen) {
      const fetchRefs = async () => {
        setLoadingRefs(true);
        try {
          const res = await api.get('/locations/reference');
          setReferences(res.data);
        } catch (err) { 
          console.error("Error loading references", err); 
        }
        setLoadingRefs(false);
      };
      fetchRefs();
    }
  }, [isOpen]);

  // 2. SYNC INITIAL DATA (FIXED MAPPING)
  useEffect(() => {
    if (data) {
      setFormData({
        db_id: data.db_id,       
        household_id: data.id, 
        head_resident_id: data.head_resident_id || '',
        house_number: data.house_number || '',
        purok_id: data.purok_id || '',
        street_id: data.street_id || '',
        tenure_status: data.tenure_status || '',
        is_indigent: data.is_indigent ? 1 : 0,
        wall_material: data.wall_material || '',
        roof_material: data.roof_material || '',
        num_families_reported: data.num_families_reported || 1,
      });
      setIsAddressTaken(false);
    }
  }, [data]);

  // 3. REAL-TIME ADDRESS CHECKER
  useEffect(() => {
    const checkAddress = async () => {
      if (!formData.purok_id || !formData.street_id || !formData.house_number) return;
      
      if (formData.purok_id === data?.purok_id && 
          formData.street_id === data?.street_id && 
          formData.house_number === data?.house_number) {
        setIsAddressTaken(false);
        return;
      }

      setIsValidating(true);
      try {
        const res = await api.post('/households/check-address', {
          purok_id: formData.purok_id,
          street_id: formData.street_id,
          house_number: formData.house_number,
          current_id: formData.db_id
        });
        setIsAddressTaken(res.data.exists);
      } catch (err) { 
        console.error("Validation error", err); 
      }
      setIsValidating(false);
    };

    const delay = setTimeout(checkAddress, 500);
    return () => clearTimeout(delay);
  }, [formData.purok_id, formData.street_id, formData.house_number, formData.db_id, data]);

  const filteredStreets = useMemo(() => {
    if (!formData.purok_id) return [];
    return (references.streets || []).filter(s => String(s.purok_id) === String(formData.purok_id));
  }, [formData.purok_id, references.streets]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isAddressTaken) return;
    await onUpdate(formData.db_id, formData);
  };

  const inputClass = `w-full p-3 rounded-xl border ${t.cardBorder} ${t.cardBg} ${t.cardText} focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-kumbh text-sm`;
  const labelClass = `text-[10px] font-black uppercase tracking-[0.15em] ${t.subtleText} mb-1.5 block`;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="EDIT HOUSEHOLD PROFILE" t={t} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        
        {/* DISPLAY SECTION */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M8 18v-3"/><path d="M16 18v-3"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Household ID</p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-200 font-mono tracking-tight">
                {formData.household_id}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Head Resident</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
              {data?.head || 'No Head Assigned'}
            </p>
          </div>
        </div>

        {/* FORM FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className={labelClass}>House No.</label>
            <input 
              className={`${inputClass} ${isAddressTaken ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
              value={formData.house_number} 
              onChange={(e) => setFormData({...formData, house_number: e.target.value})} 
              placeholder="e.g. 123-A"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Purok</label>
            <select className={inputClass} value={formData.purok_id} onChange={(e) => setFormData({...formData, purok_id: e.target.value, street_id: ''})}>
              <option value="">Select Purok</option>
              {references.puroks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Street</label>
            <select className={inputClass} value={formData.street_id} onChange={(e) => setFormData({...formData, street_id: e.target.value})} disabled={!formData.purok_id}>
              <option value="">{formData.purok_id ? "Select Street" : "Choose Purok First"}</option>
              {filteredStreets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {isAddressTaken && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 animate-pulse">
            <p className="text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
              ⚠️ Address Conflict: This location is already occupied.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Wall Material</label>
            <select className={inputClass} value={formData.wall_material} onChange={(e) => setFormData({...formData, wall_material: e.target.value})}>
              <option value="">Select Material</option>
              {references.wall_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Roof Material</label>
            <select className={inputClass} value={formData.roof_material} onChange={(e) => setFormData({...formData, roof_material: e.target.value})}>
              <option value="">Select Material</option>
              {references.roof_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tenure Status</label>
            <select className={inputClass} value={formData.tenure_status} onChange={(e) => setFormData({...formData, tenure_status: e.target.value})}>
              <option value="">Select Status</option>
              {references.tenure_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Indigent Status</label>
            <select className={inputClass} value={formData.is_indigent} onChange={(e) => setFormData({...formData, is_indigent: Number(e.target.value)})}>
              <option value={0}>General Unit</option>
              <option value={1}>Indigent Unit</option>
            </select>
          </div>
        </div>
<div>
  <label className={labelClass}>Number of Families</label>
  <input 
    type="number"
    min="1"
    className={inputClass} 
    value={formData.num_families_reported} 
    onChange={(e) => setFormData({...formData, num_families_reported: e.target.value})} 
  />
</div>
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} className={`text-[11px] font-black uppercase tracking-widest ${t.subtleText} px-4 hover:opacity-70`}>
            Discard
          </button>
          <Button 
            label={isValidating ? "Validating..." : loadingRefs ? "Syncing..." : "Update Household"} 
            variant="primary" 
            onClick={handleSubmit} 
            t={t} 
            disabled={loadingRefs || isAddressTaken || isValidating}
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default EditHouseholdModal;
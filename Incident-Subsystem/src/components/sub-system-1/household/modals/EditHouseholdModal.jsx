import React, { useState, useEffect, useMemo } from 'react';
import ModalWrapper from '../../common/ModalWrapper';
import Button from '../../common/Button'; 
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const EditHouseholdModal = ({ isOpen, onClose, data, onUpdate, t }) => {
  const [formData, setFormData] = useState({
    db_id: '',
    head_resident_id: '',
    house_number: '',
    purok_id: '',
    street_id: '',
    tenure_status: '',
    is_indigent: 0,
    wall_material: '',
    roof_material: '',
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
          const res = await axios.get(`${API_BASE_URL}/locations/reference`);
          setReferences(res.data);
        } catch (err) { console.error("Error loading references", err); }
        setLoadingRefs(false);
      };
      fetchRefs();
    }
  }, [isOpen]);

  // 2. SYNC INITIAL DATA
  useEffect(() => {
    if (data) {
      setFormData({
        db_id: data.db_id,
        head_resident_id: data.head_resident_id || '',
        house_number: data.house_number || '',
        purok_id: data.purok_id || '',
        street_id: data.street_id || '',
        tenure_status: data.tenure_status || '',
        is_indigent: data.is_indigent ? 1 : 0,
        wall_material: data.wall_material || '',
        roof_material: data.roof_material || '',
      });
      setIsAddressTaken(false);
    }
  }, [data]);

  // 3. REAL-TIME ADDRESS CHECKER (Debounced)
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
        const res = await axios.post(`${API_BASE_URL}/households/check-address`, {
          purok_id: formData.purok_id,
          street_id: formData.street_id,
          house_number: formData.house_number,
          current_id: formData.db_id
        });
        setIsAddressTaken(res.data.exists);
      } catch (err) { console.error("Validation error", err); }
      setIsValidating(false);
    };

    const delay = setTimeout(checkAddress, 500);
    return () => clearTimeout(delay);
  }, [formData.purok_id, formData.street_id, formData.house_number]);

  const filteredStreets = useMemo(() => {
    if (!formData.purok_id) return [];
    return references.streets.filter(s => String(s.purok_id) === String(formData.purok_id));
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
        
        {/* ROW 1: HEAD & HOUSE NO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Household Head (Read Only)</label>
            <div className={`${inputClass} bg-slate-50/50 dark:bg-slate-800/50 opacity-70 cursor-not-allowed italic truncate`}>
              {data?.head || 'No Head Assigned'}
            </div>
          </div>
          <div>
            <label className={labelClass}>House No.</label>
            <input 
              className={`${inputClass} ${isAddressTaken ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
              value={formData.house_number} 
              onChange={(e) => setFormData({...formData, house_number: e.target.value})} 
              placeholder="e.g. 123-A"
            />
          </div>
        </div>

        {/* ROW 2: PUROK & STREET */}
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

        {/* ADDRESS CONFLICT WARNING */}
        {isAddressTaken && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 animate-pulse">
            <p className="text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
              ⚠️ Address Conflict: This location is already occupied by another household.
            </p>
          </div>
        )}

        {/* ROW 3: MATERIALS */}
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

        {/* ROW 4: TENURE & STATUS */}
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

        {/* FOOTER ACTIONS */}
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
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ModalWrapper from '../../common/ModalWrapper';
import Button from '../../common/Button'; 
import ScreenLoader from '../../../shared/ScreenLoader';
import api from '../../../../services/sub-system-1/Api';
import { Home, Info, AlertCircle, RefreshCw } from 'lucide-react';

const EditHouseholdModal = ({ isOpen, onClose, data, onUpdate, onToast, t, currentTheme = 'modern' }) => {
  const [formData, setFormData] = useState({
    db_id: '',
    household_id: '',
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
  const [isSaving, setIsSaving] = useState(false);

  const snapRef = useRef({});
  const isDark = currentTheme === 'dark';

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
        } finally {
          setLoadingRefs(false);
        }
      };
      fetchRefs();
    }
  }, [isOpen]);

  // 2. SYNC INITIAL DATA
  useEffect(() => {
    if (data && isOpen) {
      const newFormData = {
        db_id: data.db_id || '',
        household_id: data.id || '', 
        head_resident_id: data.head_resident_id || '',
        house_number: data.house_number || '',
        purok_id: data.purok_id || '',
        street_id: data.street_id || '',
        tenure_status: data.tenure_status || '',
        is_indigent: data.is_indigent ? 1 : 0,
        wall_material: data.wall_material || '',
        roof_material: data.roof_material || '',
        num_families_reported: data.num_families_reported || 1,
      };
      setFormData(newFormData);
      snapRef.current = newFormData;
      setIsAddressTaken(false);
    }
  }, [data, isOpen]);

  // 3. REAL-TIME ADDRESS CHECKER (Debounced)
  useEffect(() => {
    const checkAddress = async () => {
      // Don't check if incomplete
      if (!formData.purok_id || !formData.street_id || !formData.house_number) return;
      
      // Skip if it's the SAME as the current address
      if (
        String(formData.purok_id) === String(data?.purok_id) && 
        String(formData.street_id) === String(data?.street_id) && 
        formData.house_number.trim() === data?.house_number?.trim()
      ) {
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
      } finally {
        setIsValidating(false);
      }
    };

    const delay = setTimeout(checkAddress, 600);
    return () => clearTimeout(delay);
  }, [formData.purok_id, formData.street_id, formData.house_number, formData.db_id, data]);

  const filteredStreets = useMemo(() => {
    if (!formData.purok_id) return [];
    return (references.streets || []).filter(s => String(s.purok_id) === String(formData.purok_id));
  }, [formData.purok_id, references.streets]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isAddressTaken || isValidating || isSaving) return;
    setIsSaving(true);
    try {
      await onUpdate(formData.db_id, formData);
      
      // Fetch fresh household data from API to show updated values
      try {
        const freshRes = await api.get(`/households/${formData.db_id}`);
        if (freshRes.data) {
          const freshData = {
            db_id: freshRes.data.db_id || '',
            household_id: freshRes.data.id || '', 
            head_resident_id: freshRes.data.head_resident_id || '',
            house_number: freshRes.data.house_number || '',
            purok_id: freshRes.data.purok_id || '',
            street_id: freshRes.data.street_id || '',
            tenure_status: freshRes.data.tenure_status || '',
            is_indigent: freshRes.data.is_indigent ? 1 : 0,
            wall_material: freshRes.data.wall_material || '',
            roof_material: freshRes.data.roof_material || '',
            num_families_reported: freshRes.data.num_families_reported || 1,
          };
          setFormData(freshData);
          snapRef.current = freshData;
        }
      } catch (err) {
        console.error('Failed to fetch fresh household data:', err);
      }
      
      // Success toast
      setTimeout(() => {
        onToast?.({
          type: 'success',
          title: 'Household Updated',
          message: 'Household profile has been saved successfully.',
          duration: 4000,
        });
      }, 100);
    } catch (err) {
      // Error toast
      setTimeout(() => {
        onToast?.({
          type: 'error',
          title: 'Save Failed',
          message: err.message || 'Failed to save changes.',
          duration: 5000,
        });
      }, 100);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-2xl border-2 transition-all outline-none font-kumbh text-sm
    ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-200 focus:border-emerald-500/50' : 'bg-white border-slate-100 text-slate-700 focus:border-emerald-500'}
    disabled:opacity-50 disabled:cursor-not-allowed`;

  const labelClass = `text-[10px] font-black uppercase tracking-[0.2em] ${t.subtleText} mb-2 ml-1 block font-spartan`;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Household Profile" t={t} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="p-2 space-y-6">
        
        {/* Header Display Card */}
        <div className={`flex items-center justify-between p-5 rounded-[2rem] border-2 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Home size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 font-spartan">Business ID</p>
              <p className="text-md font-black font-mono tracking-tight">{formData.household_id}</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 font-spartan">Current Head</p>
            <p className={`text-sm font-bold truncate max-w-[180px] ${t.cardText}`}>{data?.head || 'No Head Assigned'}</p>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Location Details</span>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className={labelClass}>House No.</label>
              <input 
                className={`${inputClass} ${isAddressTaken ? 'border-red-500 focus:border-red-500' : ''}`} 
                value={formData.house_number} 
                onChange={(e) => setFormData({...formData, house_number: e.target.value})} 
                placeholder="e.g. 123-A"
              />
            </div>
            <div className="md:col-span-4">
              <label className={labelClass}>Purok</label>
              <select className={inputClass} value={formData.purok_id} onChange={(e) => setFormData({...formData, purok_id: e.target.value, street_id: ''})}>
                <option value="">Select Purok</option>
                {references.puroks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-4">
              <label className={labelClass}>Street</label>
              <select className={inputClass} value={formData.street_id} onChange={(e) => setFormData({...formData, street_id: e.target.value})} disabled={!formData.purok_id}>
                <option value="">{formData.purok_id ? "Select Street" : "Choose Purok First"}</option>
                {filteredStreets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {isAddressTaken && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={16} className="text-rose-500" />
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider">
                Address Conflict: This location is already occupied by another household.
              </p>
            </div>
          )}
        </div>

        {/* Materials & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <label className={labelClass}>Structure Materials</label>
            <div className="grid grid-cols-2 gap-3">
              <select className={inputClass} value={formData.wall_material} onChange={(e) => setFormData({...formData, wall_material: e.target.value})}>
                <option value="">Wall Type</option>
                {references.wall_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select className={inputClass} value={formData.roof_material} onChange={(e) => setFormData({...formData, roof_material: e.target.value})}>
                <option value="">Roof Type</option>
                {references.roof_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className={labelClass}>Household Status</label>
            <div className="grid grid-cols-2 gap-3">
              <select className={inputClass} value={formData.tenure_status} onChange={(e) => setFormData({...formData, tenure_status: e.target.value})}>
                <option value="">Tenure</option>
                {references.tenure_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select className={inputClass} value={formData.is_indigent} onChange={(e) => setFormData({...formData, is_indigent: Number(e.target.value)})}>
                <option value={0}>General Unit</option>
                <option value={1}>Indigent Unit</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                <Info size={14} className="text-blue-500" />
             </div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Total Families in House</p>
           </div>
           <input 
              type="number"
              min="1"
              className="w-16 text-center bg-transparent font-black text-lg focus:outline-none border-b-2 border-emerald-500/30 focus:border-emerald-500" 
              value={formData.num_families_reported} 
              onChange={(e) => setFormData({...formData, num_families_reported: Math.max(1, parseInt(e.target.value) || 1)})} 
            />
        </div>

        <div className="flex justify-end items-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button" 
            onClick={onClose} 
            className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-colors"
          >
            Discard Changes
          </button>
          <Button 
            label={isSaving ? "Saving..." : isValidating ? "Checking..." : loadingRefs ? "Syncing..." : "Update Household"} 
            variant="primary" 
            onClick={handleSubmit} 
            t={t} 
            disabled={loadingRefs || isAddressTaken || isValidating || isSaving}
            icon={isValidating ? RefreshCw : null}
          />
        </div>
      </form>
      <ScreenLoader 
        show={isSaving} 
        title="Saving Changes" 
        description="Please wait while we update the household record..."
      />
    </ModalWrapper>
  );
};

export default EditHouseholdModal;
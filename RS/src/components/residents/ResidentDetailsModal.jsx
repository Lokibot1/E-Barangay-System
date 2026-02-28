import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, IdCard, Save, Edit3, XCircle } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/avatar';
import ModalWrapper from '../common/ModalWrapper';
import { API_BASE_URL } from '../../config/api';
import axios from 'axios';

// Import Sub-components
import IdentityTab from './tabs/IdentityTab';
import AddressTab from './tabs/AddressTab';
import SocioEcoTab from './tabs/SocioEcoTab';

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
};

const ResidentDetailsModal = ({ isOpen, onClose, resident, onSave, mode }) => {
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic'); 
    const today = new Date().toISOString().split("T")[0];

    const [refs, setRefs] = useState({ 
        puroks: [], streets: [], marital_statuses: [], sectors: [],
        genders: [], birth_registrations: [], residency_statuses: [],
        educational_statuses: [], school_types: [], school_levels: [],
        employment_statuses: [], monthly_income: [], income_sources: [], nationalities: [],
        voter_options: ['Yes', 'No'],
        household_positions: ['Head of Family', 'Spouse', 'Son', 'Daughter', 'Relative', 'Househelp', 'Others'],
        attainment_options: ['No Schooling', 'Elementary Level', 'Elementary Graduate', 'High School Level', 'High School Graduate', 'Senior High Level', 'Senior High Graduate', 'Vocational Course', 'College Level', 'College Graduate', 'Post-Graduate Study', 'N/A']
    });

    useEffect(() => {
        if (isOpen && resident) {
            fetchReferences();
            setFormData({
                ...resident,
                employment_status: resident.employment_status || resident.employmentStatus,
                income_source: resident.income_source || resident.incomeSource,
                educational_status: resident.educational_status || resident.educationalStatus,
                highest_attainment: resident.highest_attainment || resident.highestGrade,
                school_level: resident.school_level || resident.schoolLevel,
                school_type: resident.school_type || resident.schoolType,
                residency_start_date: formatDateForInput(resident.residency_start_date),
                birthdate: formatDateForInput(resident.birthdate),
                is_voter: (resident.is_voter == 1 || resident.is_voter === 'Yes') ? 'Yes' : 'No'
            });
            setIsEdit(mode === 'edit');
            setActiveTab('basic');
        }
    }, [isOpen, resident, mode]);

    const fetchReferences = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/reference-data`);
            if (res.data) setRefs(prev => ({ ...prev, ...res.data }));
        } catch (err) { console.error("Reference Fetch Error:", err); }
    };

    const calculateAge = (bday) => {
        if (!bday) return 'N/A';
        const birthDate = new Date(bday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'birthdate') {
            setFormData(prev => ({ ...prev, [name]: value, age: calculateAge(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e) => {
        if(e) e.preventDefault();
        setLoading(true);
        const payload = { ...formData, is_voter: formData.is_voter === 'Yes' ? 1 : 0 };
        const success = await onSave(payload);
        setLoading(false);
        if (success) setIsEdit(false);
    };

    const getFullHardcodedAddress = () => {
        const house = formData.temp_house_number || '';
        const streetObj = (refs.streets || []).find(s => String(s.id) === String(formData.temp_street_id));
        const streetName = streetObj ? streetObj.name : '';
        const purokObj = (refs.puroks || []).find(p => String(p.id) === String(formData.temp_purok_id));
        const purokName = purokObj ? `Purok ${purokObj.number || purokObj.name}` : '';
        return [house, streetName, purokName, "Gulod, QC"].filter(p => p && p.trim() !== "").join(", ");
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button 
            type="button" 
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                activeTab === id 
                ? 'text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
            <Icon size={14} /> {label}
            {activeTab === id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-500" />
            )}
        </button>
    );

    return (
        <ModalWrapper 
            isOpen={isOpen} 
            onClose={onClose} 
            maxWidth="max-w-5xl"
            title={
                <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-white shadow-inner ring-2 ring-white dark:ring-slate-800 ${getAvatarColor(resident?.name || '')}`}>
                        <span className="text-lg tracking-tighter">
                            {getInitials(resident?.name || '')}
                        </span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                            {resident?.name || 'Resident Profile'}
                        </h2>
                        <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wider font-mono">
                            #{resident?.tracking_number || resident?.id || 'NEW'}
                        </span>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col -m-6 h-full">
                {/* Compact Navigation */}
                <div className="flex bg-slate-50/50 dark:bg-slate-800/30 border-b dark:border-slate-800 px-6">
                    <TabButton id="basic" label="Identity" icon={IdCard} />
                    <TabButton id="address" label="Address" icon={MapPin} />
                    <TabButton id="socio" label="Socio-Eco" icon={Briefcase} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white dark:bg-slate-900 min-h-[50vh] max-h-[60vh]">
                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'basic' && <IdentityTab isEdit={isEdit} formData={formData} handleChange={handleChange} refs={refs} today={today} />}
                        {activeTab === 'address' && <AddressTab isEdit={isEdit} formData={formData} handleChange={handleChange} refs={refs} getFullHardcodedAddress={getFullHardcodedAddress} filteredStreets={(refs.streets || []).filter(s => String(s.purok_id) === String(formData.temp_purok_id))} />}
                        {activeTab === 'socio' && <SocioEcoTab isEdit={isEdit} formData={formData} handleChange={handleChange} refs={refs} />}
                    </div>
                </div>

              
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-between items-center px-10">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors tracking-widest"
                    >
                        Close Profile
                    </button>
                    
                    <div className="flex items-center gap-3">
                        {/* Edit / Cancel Toggle Button */}
                        <button 
                            type="button" 
                            onClick={() => setIsEdit(!isEdit)} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
                                isEdit 
                                ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50' 
                                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 dark:bg-slate-800 dark:border-slate-700'
                            }`}
                        >
                            {isEdit ? <><XCircle size={14} /> Cancel Edit</> : <><Edit3 size={14} /> Edit Record</>}
                        </button>

                        {/* Save Button (Visible only when in edit mode) */}
                        {isEdit && (
                            <button 
                                type="button" 
                                onClick={handleSave} 
                                disabled={loading} 
                                className="flex items-center gap-2 px-10 py-3 bg-emerald-600 text-white text-[11px] font-black uppercase rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default ResidentDetailsModal;
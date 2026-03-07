import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, IdCard, Save, Edit3, XCircle, User } from 'lucide-react'; 
import ModalWrapper from '../common/ModalWrapper';
import api from '../../../services/sub-system-1/Api';

import IdentityTab from './tabs/IdentityTab';
import AddressTab from './tabs/AddressTab';
import SocioEcoTab from './tabs/SocioEcoTab';

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
};

const modalAccentMap = {
    modern: { text: 'text-blue-600', bar: 'bg-blue-600', border: 'border-blue-200', hover: 'hover:bg-blue-50' },
    blue: { text: 'text-blue-600', bar: 'bg-blue-600', border: 'border-blue-200', hover: 'hover:bg-blue-50' },
    purple: { text: 'text-purple-600', bar: 'bg-purple-600', border: 'border-purple-200', hover: 'hover:bg-purple-50' },
    green: { text: 'text-green-600', bar: 'bg-green-600', border: 'border-green-200', hover: 'hover:bg-green-50' },
    dark: { text: 'text-slate-200', bar: 'bg-slate-300', border: 'border-slate-600', hover: 'hover:bg-slate-700' },
};

const ResidentDetailsModal = ({ isOpen, onClose, resident, onSave, mode, t, currentTheme = 'modern' }) => {
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const today = new Date().toISOString().split("T")[0];
    const accent = modalAccentMap[currentTheme] || modalAccentMap.modern;

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
            
            const extractId = (val) => {
                if (!val) return '';
                if (typeof val === 'object') return String(val.id || '');
                return String(val);
            };

            setFormData({
                ...resident,
                first_name: resident.firstName || resident.first_name || '',
                middle_name: resident.middleName || resident.middle_name || '',
                last_name: resident.lastName || resident.last_name || '',
                contact_number: resident.contact || resident.contact_number || '',
                nationality_id: extractId(resident.nationality || resident.nationality_id),
                sector_id: extractId(resident.sector || resident.sector_id),
                marital_status_id: extractId(resident.maritalStatus || resident.marital_status_id),
                temp_purok_id: extractId(resident.purok || resident.temp_purok_id),
                temp_street_id: extractId(resident.street || resident.temp_street_id),
                temp_house_number: resident.houseNumber || resident.temp_house_number || '',
                employment_status: resident.employmentStatus || resident.employment_status || '',
                income_source: resident.incomeSource || resident.income_source || '',
                educational_status: resident.educationalStatus || resident.educational_status || '',
                highest_attainment: resident.highestGrade || resident.highest_attainment || '',
                school_level: resident.schoolLevel || resident.school_level || '',
                school_type: resident.schoolType || resident.school_type || '',
                residency_start_date: formatDateForInput(resident.residencyStartDate || resident.residency_start_date),
                birthdate: formatDateForInput(resident.birthdate),
                is_voter: (resident.isVoter == 1 || resident.is_voter == 1 || resident.isVoter === 'Yes' || resident.is_voter === 'Yes') ? 'Yes' : 'No',
                age: resident.age || calculateAge(resident.birthdate)
            });
            setIsEdit(mode === 'edit');
            setActiveTab('basic');
        }
    }, [isOpen, resident, mode]);

    const fetchReferences = async () => {
        try {
            const res = await api.get('/reference-data');
            if (res.data) setRefs(prev => ({ ...prev, ...res.data }));
        } catch (err) { 
            console.error("Reference Fetch Error:", err); 
        }
    };

    const calculateAge = (bday) => {
        if (!bday) return 'N/A';
        const birthDate = new Date(bday);
        const todayDate = new Date();
        let age = todayDate.getFullYear() - birthDate.getFullYear();
        const m = todayDate.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && todayDate.getDate() < birthDate.getDate())) age--;
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
        const success = await onSave(formData);
        setLoading(false);
        if (success) setIsEdit(false);
    };

    const getFullHardcodedAddress = () => {
        const house = formData.temp_house_number || '';
        const streetObj = (refs.streets || []).find(s => String(s.id) === String(formData.temp_street_id));
        const streetName = streetObj ? streetObj.name : '';
        const purokObj = (refs.puroks || []).find(p => String(p.id) === String(formData.temp_purok_id));
        const purokName = purokObj ? `Purok ${purokObj.number || purokObj.name}` : '';
        return [house, streetName, purokName, "Barangay Gulod Novaliches, Quezon City"].filter(p => p && p.trim() !== "").join(", ");
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                activeTab === id
                ? `${accent.text} ${t?.cardBg || 'bg-white dark:bg-slate-900'}`
                : `text-slate-500 hover:text-slate-700 dark:hover:text-slate-300`
            }`}
        >
            <Icon size={14} /> {label}
            {activeTab === id && (
                <div className={`absolute bottom-0 left-0 w-full h-0.5 ${accent.bar}`} />
            )}
        </button>
    );

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-5xl"
            t={t}
            title={
                <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-inner ring-2 ring-white dark:ring-slate-700`}>
                        <User size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className={`text-base font-black ${t?.cardText || 'text-slate-800 dark:text-white'} uppercase tracking-tight leading-none`}>
                            {formData.first_name ? `${formData.first_name} ${formData.last_name}` : (resident?.name || 'Resident Profile')}
                        </h2>
                        <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wider font-mono">
                            #{resident?.tracking_number || resident?.id || 'NEW'}
                        </span>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col -m-6 h-full">
                <div className={`flex ${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} border-b ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} px-6`}>
                    <TabButton id="basic" label="Identity" icon={IdCard} />
                    <TabButton id="address" label="Address" icon={MapPin} />
                    <TabButton id="socio" label="Socio-Eco" icon={Briefcase} />
                </div>

                <div className={`flex-1 overflow-y-auto p-6 md:p-10 ${t?.cardBg || 'bg-white dark:bg-slate-900'} min-h-[50vh] max-h-[60vh]`}>
                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'basic' && <IdentityTab isEdit={isEdit} formData={formData} handleChange={handleChange} refs={refs} today={today} t={t} currentTheme={currentTheme} />}
                        {activeTab === 'address' && <AddressTab isEdit={isEdit} formData={formData} handleChange={handleChange} refs={refs} getFullHardcodedAddress={getFullHardcodedAddress} filteredStreets={(refs.streets || []).filter(s => String(s.purok_id) === String(formData.temp_purok_id))} t={t} currentTheme={currentTheme} />}
                        {activeTab === 'socio' && <SocioEcoTab isEdit={isEdit} formData={formData} handleChange={handleChange} refs={refs} t={t} currentTheme={currentTheme} />}
                    </div>
                </div>

                <div className={`p-6 ${t?.inlineBg || 'bg-slate-50 dark:bg-slate-800/50'} border-t ${t?.cardBorder || 'border-slate-200 dark:border-slate-800'} flex justify-between items-center px-10`}>
                    <button type="button" onClick={onClose} className="text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors tracking-widest">
                        Close Profile
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEdit(!isEdit)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
                                isEdit ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50' : `${t?.cardBg || 'bg-white dark:bg-slate-800'} ${accent.text} ${accent.border} ${accent.hover}`
                            }`}
                        >
                            {isEdit ? <><XCircle size={14} /> Cancel Edit</> : <><Edit3 size={14} /> Edit Record</>}
                        </button>

                        {isEdit && (
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                                className={`flex items-center gap-2 px-10 py-3 ${t?.primarySolid || 'bg-blue-600'} ${t?.primaryHover || 'hover:bg-blue-700'} text-white text-[11px] font-black uppercase rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50`}
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

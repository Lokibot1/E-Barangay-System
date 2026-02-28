import { useState, useEffect, useMemo } from 'react';
import { residentService } from '../services/residents';

export const useResidents = () => {
    const [allResidents, setAllResidents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            setError(null);
            const data = await residentService.getResidents();
            setAllResidents(data || []);
        } catch (error) {
            console.error("Error loading residents:", error);
            setError(error.message || "Failed to load residents.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filteredResidents = useMemo(() => {
        return allResidents.filter(r => {
            const sectorName = (r.sectorLabel || 'General Population').toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            const matchesSearch = 
                (r.name?.toLowerCase().includes(searchLower)) ||
                (r.full_address?.toLowerCase().includes(searchLower)) ||
                (r.barangay_id?.toLowerCase().includes(searchLower));
                                     
            const normalizedCategory = (categoryFilter || '').toLowerCase();
            const matchesCategory =
                normalizedCategory === 'all' ||
                sectorName.includes(normalizedCategory);

            return matchesSearch && matchesCategory;
        });
    }, [allResidents, searchTerm, categoryFilter]);

    const handleUpdate = async (updatedData) => {
        try {
     
            const payload = {
                first_name: updatedData.first_name,
                middle_name: updatedData.middle_name,
                last_name: updatedData.last_name,
                suffix: updatedData.suffix,
                gender: updatedData.gender,
                contact_number: updatedData.contact_number,
                birth_registration: updatedData.birth_registration,
                marital_status_id: updatedData.marital_status_id,
                sector_id: updatedData.sector_id,
                is_voter: updatedData.is_voter,
                birthdate: updatedData.birthdate,
                nationality_id: updatedData.nationality_id,
                household_position: updatedData.household_position, 

                // Address Fields
                temp_house_number: updatedData.temp_house_number,
                temp_purok_id: updatedData.temp_purok_id,
                temp_street_id: updatedData.temp_street_id,
                residency_start_date: updatedData.residency_start_date,
               // Education Data - 
    educational_status: updatedData.educational_status,
    school_type: updatedData.school_type,
    school_level: updatedData.school_level,
    highest_attainment: updatedData.highest_attainment, 

    // Employment Data
    employment_status: updatedData.employment_status,
    occupation: updatedData.occupation,
    monthly_income: updatedData.monthly_income,
    income_source: updatedData.income_source
            };

            const res = await residentService.updateResident(updatedData.id, payload);

            if (res.success) {
                await loadData(); 
                return true;
            } else {
                alert("Update failed: " + res.error);
                return false;
            }
        } catch (error) {
            console.error("Update Hook Error:", error);
            return false;
        }
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resident?")) return;
        const res = await residentService.deleteResident(id);
        if (res.success) loadData();
        return res;
    };

    return {
        residents: filteredResidents,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        handleUpdate,
        handleDelete, 
        refresh: loadData
    };
};

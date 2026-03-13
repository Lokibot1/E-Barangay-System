import api from './Api';
import { STORAGE_URL } from '../../config/api';

export const calculateAge = (birthdate) => {
    if (!birthdate) return 'N/A';
    const parts = String(birthdate).split('T')[0].split('-');
    if (parts.length < 3) return 'N/A';
    const [y, m, d] = parts.map(Number);
    const today = new Date();
    let age = today.getFullYear() - y;
    if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
    return age < 0 ? 'N/A' : age;
};

/**
 * Extract a plain YYYY-MM-DD string from whatever Laravel sends.
 */
const safeDateString = (raw) => {
    if (!raw) return '';
    const s = String(raw);

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    if (/[+-]\d{2}:\d{2}$/.test(s)) {
        const d = new Date(s);
        if (isNaN(d)) return s.slice(0, 10);
        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0'),
        ].join('-');
    }

    if (s.endsWith('Z')) {
        const d = new Date(s);
        if (isNaN(d)) return s.slice(0, 10);
        if (d.getUTCHours() >= 1) {
            const local = new Date(d.getTime() + 8 * 60 * 60 * 1000);
            return [
                local.getUTCFullYear(),
                String(local.getUTCMonth() + 1).padStart(2, '0'),
                String(local.getUTCDate()).padStart(2, '0'),
            ].join('-');
        }
        return s.split('T')[0];
    }

    return s.split('T')[0].slice(0, 10);
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const safe = safeDateString(dateStr);
    const [y, m, d] = safe.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

// ── Map a raw API resident object to the shape the frontend expects ───────────
const mapResident = (res) => {
    const birthdateSafe      = safeDateString(res.birthdate);
    const residencyStartSafe = safeDateString(res.residency_start_date);

    const ageVal   = calculateAge(birthdateSafe);
    const fullName = `${res.first_name || ''} ${res.middle_name || ''} ${res.last_name || ''} ${res.suffix || ''}`
        .replace(/\s+/g, ' ')
        .trim();

    return {
        id:               res.id,
        trackingNumber:   res.tracking_number,
        tracking_number:  res.tracking_number,
        barangay_id:      res.barangay_id,
        qrToken:          res.user?.qr_token    || null,
        username:         res.user?.username    || res.barangay_id,
        name:             fullName              || 'N/A',
        date:             formatDate(res.created_at),
        status:           res.status,

        sector:           res.sector?.name      || '',
        sectorLabel:      res.sector?.name      || 'General Population',

        registration_payload:          res.registration_payload,
        household_exists:              res.household_exists,
        household_indigent_status:     res.household_indigent_status,

        // ── Flat identity fields ──────────────────────────────────────────────
        first_name:          res.first_name          || '',
        middle_name:         res.middle_name          || '',
        last_name:           res.last_name            || '',
        suffix:              res.suffix               || '',
        gender:              res.gender               || '',
        contact_number:      res.contact_number       || '',
        email:               res.email                || '',
        birth_registration:  res.birth_registration   || '',
        household_id:        res.household_id,
        household_position:  res.household_position   || '',

        // ── FK IDs ────────────────────────────────────────────────────────────
        marital_status_id:   res.marital_status_id    || '',
        nationality_id:      res.nationality_id       || '',
        sector_id:           res.sector_id            || '',
        is_voter:            res.is_voter,
        temp_house_number:   res.temp_house_number    || '',
        temp_purok_id:       res.temp_purok_id        || '',
        temp_street_id:      res.temp_street_id       || '',

        // ── Dates ─────────────────────────────────────────────────────────────
        birthdate:            birthdateSafe,
        residency_start_date: residencyStartSafe,

        // ── Address computed fields ───────────────────────────────────────────
        resolved_purok:      res.resolved_purok       || 'N/A',
        resolved_street:     res.resolved_street      || 'N/A',
        full_address:        res.full_address         || '',
        age:                 res.age                  ?? ageVal,
        deleted_at:          res.deleted_at           || null,

        // ── Archive audit fields ──────────────────────────────────────────────
        // Populated by archived() endpoint — who deleted + human-readable when.
        // The backend sets these from the action_type='archive' log row.
        archived_by_name:      res.archived_by_name      || null,
        formatted_archived_at: res.formatted_archived_at || null,

        // ── Audit trail fields (set by controller's appendComputedFields) ─────
        // These are ONLY populated on show() (single resident fetch), not index().
        // The modal re-fetches via GET /residents/{id} on open, so they arrive.
        verified_by_name:      res.verified_by_name      || null,
        formatted_verified_at: res.formatted_verified_at || null,
        updated_by_name:       res.updated_by_name       || null,
        formatted_updated_by:  res.formatted_updated_by  || null,
        formatted_updated_at:  res.formatted_updated_at  || null,

        // ── Human-readable dates (all Carbon-formatted by controller) ─────────
        formatted_birthdate:       res.formatted_birthdate       || null,
        formatted_residency_start: res.formatted_residency_start || null,
        formatted_created_at:      res.formatted_created_at      || null,

        // ── Socio-eco ─────────────────────────────────────────────────────────
        employmentStatus:    res.employmentStatus     || res.employment_data?.employment_status  || 'N/A',
        occupation:          res.occupation           || res.employment_data?.occupation          || 'None',
        monthly_income:      res.monthly_income       || res.employment_data?.monthly_income      || 'N/A',
        incomeSource:        res.incomeSource         || res.employment_data?.income_source       || 'N/A',
        educationalStatus:   res.educationalStatus    || res.education_data?.educational_status   || 'N/A',
        schoolType:          res.schoolType           || res.education_data?.school_type          || 'N/A',
        schoolLevel:         res.schoolLevel          || res.education_data?.school_level         || 'N/A',
        highestGrade:        res.highestGrade         || res.education_data?.highest_grade_completed || 'N/A',

        details: {
            birthdate:          formatDate(birthdateSafe),
            age:                ageVal,
            sex:                res.gender               || 'N/A',
            contact:            res.contact_number       || 'N/A',
            email:              res.email                || 'N/A',
            maritalStatus:      res.marital_status?.name || 'N/A',
            nationality:        res.nationality?.name    || 'Filipino',
            birthRegistration:  res.birth_registration   || 'N/A',
            sector:             res.sector?.name         || '',
            houseNumber:        res.temp_house_number    || 'N/A',
            purok:              res.resolved_purok       || 'N/A',
            street:             res.resolved_street      || 'N/A',
            householdPosition:  res.household_position   || 'N/A',
            addressSummary:     `${res.temp_house_number || ''} ${res.resolved_street || ''}, ${res.resolved_purok || ''}, Brgy. Gulod`
                .replace(/N\/A/g, '').replace(/\s+/g, ' ').trim(),
            residencyStatus:    res.residency_status     || 'N/A',
            residencyStartDate: formatDate(residencyStartSafe),
            isVoter:            res.is_voter,
            idFront:            res.id_front_path ? `${STORAGE_URL}/${res.id_front_path}` : null,
            idBack:             res.id_back_path  ? `${STORAGE_URL}/${res.id_back_path}`  : null,
            idType:             res.id_type               || 'Resident ID',
            employmentStatus:   res.employment_data?.employment_status   || 'N/A',
            occupation:         res.employment_data?.occupation           || 'N/A',
            monthlyIncome:      res.employment_data?.monthly_income       || '0',
            incomeSource:       res.employment_data?.income_source        || 'N/A',
            educationalStatus:  res.education_data?.educational_status    || 'N/A',
            schoolType:         res.education_data?.school_type           || 'N/A',
            school_level:       res.education_data?.school_level          || 'N/A',
            highestGrade:       res.education_data?.highest_grade_completed || 'N/A',
        },
    };
};

// ─────────────────────────────────────────────────────────────────────────────

export const verificationService = {
    getSubmissions: async () => {
        try {
            const response = await api.get('/submissions');
            const data = Array.isArray(response.data)
                ? response.data
                : (response.data.data || []);
            return data.map(mapResident);
        } catch (error) {
            console.error('Fetch submissions error:', error);
            throw error;
        }
    },

    updateStatus: async (id, status, isIndigent, additionalData) => {
        try {
            const response = await api.put(`/residents/${id}/status`, {
                status,
                is_indigent:   isIndigent,
                wall_material: additionalData?.wallMaterial,
                roof_material: additionalData?.roofMaterial,
                water_source:  additionalData?.waterSource,
                tenure_status: additionalData?.tenureStatus,
            });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Update failed',
            };
        }
    },
};

export const residentService = {
    getResidents: async () => {
        const res = await api.get('/residents');
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        return data.map(mapResident);
    },

    // Single resident — includes audit trail fields (verified_by_name, updated_by_name, etc.)
    getResident: async (id) => {
        const res = await api.get(`/residents/${id}`);
        return mapResident(res.data);
    },

    // Archived residents — response includes archived_by_name + formatted_archived_at
    getArchivedResidents: async () => {
        const res = await api.get('/residents/archived');
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        return data.map(mapResident);
    },

    getAllLogs: async () => {
        const res = await api.get('/residents/logs');
        return Array.isArray(res.data) ? res.data : [];
    },

    getResidentHistory: async (id) => {
        const res = await api.get(`/residents/${id}/history`);
        return Array.isArray(res.data) ? res.data : [];
    },

    updateResident: async (id, payload) => {
        try {
            const res = await api.put(`/residents/${id}`, payload);
            return res.data;
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || err.message,
            };
        }
    },

    deleteResident: async (id) => {
        try {
            const res = await api.delete(`/residents/${id}`);
            return res.data;
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || err.message,
            };
        }
    },

    restoreResident: async (id) => {
        try {
            const res = await api.post(`/residents/${id}/restore`);
            return res.data;
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || err.message,
            };
        }
    },
};


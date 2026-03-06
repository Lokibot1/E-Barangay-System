import axios from 'axios';
import { API_BASE_URL, STORAGE_URL } from '../../config/api';

export const calculateAge = (birthdate) => {
  if (!birthdate) return 'N/A';
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  });
};

export const verificationService = {
  getSubmissions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/submissions`);

      return response.data.map(res => {
        const ageVal = calculateAge(res.birthdate);
        const fullName = `${res.first_name || ''} ${res.middle_name || ''} ${res.last_name || ''} ${res.suffix || ''}`
          .replace(/\s+/g, ' ')
          .trim();

        return {
          id: res.id,
          trackingNumber: res.tracking_number,
          barangayId: res.barangay_id,
          qrToken: res.user?.qr_token || null,
          username: res.user?.username || res.barangay_id,
          name: fullName || 'N/A',
          date: formatDate(res.created_at),
          status: res.status,
          sector: res.sector?.name || '',
          registration_payload: res.registration_payload, 
          household_exists: res.household_exists, 
          household_indigent_status: res.household_indigent_status,
          
          details: {
            birthdate: formatDate(res.birthdate),
            age: ageVal,
            sex: res.gender || 'N/A',
            contact: res.contact_number || 'N/A',
            email: res.email || 'N/A',
            maritalStatus: res.marital_status?.name || 'N/A', 
            nationality: res.nationality?.name || 'Filipino',
            birthRegistration: res.birth_registration || 'N/A',
            sector: res.sector?.name || '',
            houseNumber: res.temp_house_number || 'N/A',
            purok: res.resolved_purok || 'N/A',
            street: res.resolved_street || 'N/A',
            householdPosition: res.household_position || 'N/A',
            addressSummary: `${res.temp_house_number || ''} ${res.resolved_street || ''}, ${res.resolved_purok || ''}, Brgy. Gulod`
              .replace(/N\/A/g, '')
              .replace(/\s+/g, ' ')
              .trim(),
            residencyStatus: res.residency_status || 'N/A',
            residencyStartDate: formatDate(res.residency_start_date),
            isVoter: res.is_voter, 
            idFront: res.id_front_path ? `${STORAGE_URL}/${res.id_front_path}` : null,
            idBack: res.id_back_path ? `${STORAGE_URL}/${res.id_back_path}` : null,
            idType: res.id_type || 'Resident ID',
            employmentStatus: res.employment_data?.employment_status || 'N/A',
            occupation: res.employment_data?.occupation || 'N/A',
            monthlyIncome: res.employment_data?.monthly_income || '0',
            incomeSource: res.employment_data?.income_source || 'N/A', 
            educationalStatus: res.education_data?.educational_status || 'N/A',
            schoolType: res.education_data?.school_type || 'N/A',
            schoolLevel: res.education_data?.school_level || 'N/A',
            highestGrade: res.education_data?.highest_grade_completed || 'N/A',
          },
        };
      });
    } catch (error) {
      console.error("Fetch submissions error:", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch submissions');
    }
  },

  updateStatus: async (id, status, isIndigent, additionalData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/residents/${id}/status`, { 
        status,
        is_indigent: isIndigent,
        wall_material: additionalData?.wallMaterial,
        roof_material: additionalData?.roofMaterial,
        water_source: additionalData?.waterSource,
        tenure_status: additionalData?.tenureStatus
      });
      return response.data;
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      };
    }
  }
};
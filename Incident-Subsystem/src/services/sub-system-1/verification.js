import api from "./Api"; 
import { STORAGE_URL } from '../../config/api'; 

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
   
      const response = await api.get("/submissions");

      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);

      return data.map(res => {
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
            school_level: res.education_data?.school_level || 'N/A',
            highestGrade: res.education_data?.highest_grade_completed || 'N/A',
            rejection_reason: res.rejection_reason, 
            rejection_remarks: res.rejection_remarks,
            visit_set_at: res.visit_set_at ? formatDate(res.visit_set_at) : 'N/A',
            visit_set_by_name: res.visit_setter ? res.visit_setter.name : 'N/A',
            visit_set_by_role: res.visit_setter ? res.visit_setter.role : 'Staff',
            rejection_reason: res.rejection_reason || 'Incomplete documents.',
            rejection_remarks: res.rejection_remarks || '', 
            rejected_by_name: res.rejector ? res.rejector.name : 'N/A',
            rejected_at: res.status === 'Rejected' ? formatDate(res.updated_at) : null,
            rejected_by_role: res.rejector ? res.rejector.role : 'Staff',
            updated_at: res.updated_at,
          },
        };
      });
    } catch (error) {
      console.error("Fetch submissions error:", error);
      throw error;
    }
  },

  updateStatus: async (id, status, isIndigent, additionalData) => {
    try {
      const response = await api.put(`/residents/${id}/status`, { 
        status,
        is_indigent: isIndigent,
        wall_material: additionalData?.wallMaterial,
        roof_material: additionalData?.roofMaterial,
        water_source: additionalData?.waterSource,
        tenure_status: additionalData?.tenureStatus,
        num_families_reported: additionalData?.numberOfFamilies,
        rejection_reason: additionalData?.rejection_reason,
        rejection_remarks: additionalData?.rejection_remarks,
        visit_set_at: status === 'For Verification' ? new Date().toISOString() : null
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
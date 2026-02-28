import { jsPDF } from "jspdf";
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

export const verificationService = {
  getSubmissions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/submissions`);

      return response.data.map(res => {
        const ageVal = calculateAge(res.birthdate);
        
        const formatDate = (dateStr) => {
          if (!dateStr) return 'N/A';
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-US', { 
            month: 'short', day: '2-digit', year: 'numeric' 
          });
        };

        return {
          id: res.id,
          trackingNumber: res.tracking_number,
          qrToken: res.user ? res.user.qr_token : null,
          name: `${res.first_name || ''} ${res.middle_name || ''} ${res.last_name || ''} ${res.suffix || ''}`.replace(/\s+/g, ' ').trim(),
          date: formatDate(res.created_at),
          status: res.status,
          sector: res.sector?.name || '',
          
          registration_payload: res.registration_payload, 
          
          details: {
            birthdate: formatDate(res.birthdate),
            age: ageVal,
            sex: res.gender || 'N/A',
            contact: res.contact_number || 'N/A',
            maritalStatus: res.marital_status?.name || 'N/A', 
            nationality: res.nationality?.name || 'Filipino',
            birthRegistration: res.birth_registration || 'N/A',
            sector: res.sector?.name || '',
            
            // Address & Position
            houseNumber: res.temp_house_number || 'N/A',
            purok: res.resolved_purok || 'N/A',
            street: res.resolved_street || 'N/A',
            householdPosition: res.household_position || 'N/A',
            
            addressSummary: `${res.temp_house_number || ''} ${res.resolved_street || ''}, ${res.resolved_purok || ''}, Brgy. Gulod`.replace(/N\/A/g, '').trim(),
            
            residencyStatus: res.residency_status || 'N/A',
            residencyStartDate: formatDate(res.residency_start_date),
            isVoter: res.is_voter, 
            
            idFront: res.id_front_path ? `${STORAGE_URL}/${res.id_front_path}` : null,
            idBack: res.id_back_path ? `${STORAGE_URL}/${res.id_back_path}` : null,
            idType: res.id_type || 'Resident ID',
            
            // Employment
            employmentStatus: res.employment_data?.employment_status || 'N/A',
            occupation: res.employment_data?.occupation || 'N/A',
            monthlyIncome: res.employment_data?.monthly_income || '0',
            incomeSource: res.employment_data?.income_source || 'N/A', 
            
            // Education
            educationalStatus: res.education_data?.educational_status || 'N/A',
            schoolType: res.education_data?.school_type || 'N/A',
            schoolLevel: res.education_data?.school_level || 'N/A',
            highestGrade: res.education_data?.highest_grade_completed || 'N/A',
          },
        };
      });
    } catch (error) {
      console.error("Fetch submissions error:", error);
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch submissions';
      throw new Error(message);
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/residents/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  }
};

// ─── PDF Slip ────────────────────────────────────────────────────────────────

export const handleDownloadSlip = (data) => {
  try {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a6' });

    doc.setFillColor(21, 128, 61);
    doc.rect(0, 0, 105, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BARANGAY GULOD NOVALICHES", 52.5, 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Quezon City, NCR - Philippines", 52.5, 18, { align: 'center' });
    doc.setFontSize(8);
    doc.text("OFFICIAL REGISTRATION SLIP", 52.5, 24, { align: 'center' });

    doc.setDrawColor(21, 128, 61);
    doc.setLineWidth(0.5);
    doc.line(10, 35, 95, 35);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("FULL NAME:", 10, 45);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(String(data?.name || "APPLICANT").toUpperCase(), 10, 52);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("TRACKING NUMBER:", 10, 65);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 128, 61);
    doc.text(String(data?.trackingNumber || "N/A"), 10, 73);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("STATUS:", 10, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(String(data?.status || "Pending").toUpperCase(), 10, 92);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const dateText = data?.submittedDate || new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    doc.text(`Submitted: ${dateText}`, 10, 103);

    doc.setFillColor(245, 245, 245);
    doc.rect(0, 115, 105, 33, 'F');
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("IMPORTANT REMINDER:", 10, 122);
    doc.setFont("helvetica", "normal");
    doc.text("• Keep this slip for your records", 10, 127);
    doc.text("• Use tracking number to monitor status", 10, 132);
    doc.text("• Bring valid ID for verification visit", 10, 137);
    doc.text("• Contact barangay for any concerns", 10, 142);

    doc.save(`Registration-Slip-${data?.trackingNumber || 'BGN-XXXX'}.pdf`);

  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Failed to generate PDF slip.");
  }
};

// ─── QR Download ─────────────────────────────────────────────────────────────

export const downloadResidentQR = (qrElementId, residentData) => {
  try {
    const svg = document.getElementById(qrElementId);
    if (!svg) throw new Error("QR Code element not found");

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas  = document.createElement("canvas");
    const ctx     = canvas.getContext("2d");
    const img     = new Image();

    img.onload = () => {
      canvas.width = canvas.height = 1000;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 1000, 1000);
      ctx.drawImage(img, 100, 100, 800, 800);

      const link = document.createElement("a");
      link.download = `QR-${residentData.barangayId || 'BGN'}-${residentData.name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  } catch (err) {
    console.error("QR Download Error:", err);
    alert("Failed to download QR code.");
  }
};

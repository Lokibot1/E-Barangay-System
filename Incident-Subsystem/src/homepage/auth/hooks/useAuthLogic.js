import { useState, useEffect } from 'react';
import { authService } from './auth';

export const useAuthLogic = (navigate) => {
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(null);
  const [trackingNum, setTrackingNum] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [purokList, setPurokList] = useState([]);
  const [allStreets, setAllStreets] = useState([]);
  const [addressExists, setAddressExists] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "", suffix: "", 
    birthdate: "", age: "", gender: "", 
    sector: "", householdPosition: "", maritalStatus: "", nationality: "Filipino", 
    residencyStatus: "", residencyStartDate: "", isVoter: false, 
    birthRegistration: "Registered",
    purok: "", street: "", houseNumber: "", 
    contact: "", email: "", // Email field is correctly placed here
    employmentStatus: "N/A", occupation: "", incomeSource: "N/A", monthlyIncome: "0",
    educationalStatus: "N/A", schoolType: "N/A", schoolLevel: "N/A", highestGrade: "N/A",
    idFront: null, idBack: null, idType: "Barangay ID",
    username: "", password: "",
    tenureStatus: "Owned", wallMaterial: "Concrete", roofMaterial: "G.I. Sheet",
    waterSource: "Maynilad", isIndigent: 0,
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await authService.getLocations();
        setPurokList(Array.isArray(res?.puroks) ? res.puroks : []);
        setAllStreets(Array.isArray(res?.streets) ? res.streets : []);
      } catch (err) { console.error("Failed to load locations:", err); }
    };
    fetchLocations();
  }, []);

  // ADDRESS CHECK LOGIC WITH DEBOUNCE
  useEffect(() => {
    const checkAddress = async () => {
      if (formData.houseNumber && formData.street && formData.purok) {
        try {
          const res = await authService.checkHouseholdHead({
            houseNumber: formData.houseNumber,
            street: formData.street,
            purok: formData.purok
          });

          if (res && typeof res.exists !== 'undefined') {
            setAddressExists(!!res.exists); 
          }
        } catch (err) {
          console.error("Address check failed:", err);
          setAddressExists(false); 
        }
      } else {
        setAddressExists(false);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      checkAddress();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.houseNumber, formData.street, formData.purok]);

  const handleChange = (e) => {
    // FIXED: Support for direct object passing (from handleFile in SignupForm)
    if (!e.target && e.name) {
      setFormData(prev => ({ ...prev, [e.name]: e.value }));
      return;
    }

    const { name, value, type, checked, files } = e.target;

    // Logic for Files
    if (type === 'file') {
      const selectedFile = files[0];
      if (selectedFile) {
        setFormData(prev => ({ ...prev, [name]: selectedFile }));
      }
      return;
    }

    // Logic for Checkbox
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    // Contact Number formatting (09XXXXXXXXX)
    if (name === 'contact') {
      const val = value.replace(/\D/g, '').substring(0, 11);
      setFormData(prev => ({ ...prev, [name]: val }));
      return;
    }

    // Birthdate & Auto-Age logic
    if (name === 'birthdate') {
      if (!value) {
        setFormData(prev => ({ ...prev, birthdate: "", age: "" }));
        return;
      }
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calculatedAge--;
      
      setFormData(prev => ({ 
        ...prev, 
        birthdate: value, 
        age: isNaN(calculatedAge) || calculatedAge < 0 ? "" : calculatedAge,
        // Auto-set to Senior Citizen sector if 60+
        sector: calculatedAge >= 60 ? "3" : prev.sector 
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitAuth = async (isSignup) => {
    setLoading(true);
    try {
      if (isSignup) {
        const res = await authService.register(formData);
        // FIXED: Support for res.success OR res.tracking_number
        if (res.success || res.trackingNumber) {
          setAuthSuccess({
            title: "Registration Submitted!",
            msg: "Application is now for review.",
            code: res.trackingNumber || res.tracking_number,
            resident: res.resident
          });
        }
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      // Improved error alerting
      const errorMsg = error.response?.data?.message || error.message || "Registration failed. Please check your data.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSearch = async (val) => {
    const input = val.toUpperCase().trim();
    setTrackingNum(input);
    if (input.length >= 8) {
      try {
        const res = await authService.track(input);
        if (res.success) setSearchResult(res.data);
      } catch (err) {
        setSearchResult({ status: "NOT_FOUND", message: "Tracking number not found." });
      }
    } else {
      setSearchResult(null);
    }
  };

  return { 
    formData, setFormData, handleChange, submitAuth, loading, 
    authSuccess, setAuthSuccess, trackingNum, handleTrackSearch, 
    searchResult, purokList, allStreets, addressExists 
  };
};
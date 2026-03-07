/**
 * useAuthLogic.js
 * Custom hook that manages all registration/signup form state and logic.
 * Used by: LoginPage.jsx and SignupPage.jsx
 *
 * Location: src/homepage/hooks/useAuthLogic.js
 */

import { useState, useEffect } from "react";
import { authService } from "../services/authService"; // ← authService.js (port 8002)

export const useAuthLogic = (navigate) => {
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(null);
  const [trackingNum, setTrackingNum] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [purokList, setPurokList] = useState([]);
  const [allStreets, setAllStreets] = useState([]);
  const [addressExists, setAddressExists] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    birthdate: "",
    age: "",
    gender: "",
    sector: "",
    householdPosition: "",
    maritalStatus: "",
    nationality: "Filipino",
    residencyStatus: "",
    residencyStartDate: "",
    isVoter: false,
    birthRegistration: "Registered",
    purok: "",
    street: "",
    houseNumber: "",
    contact: "",
    email: "",
    employmentStatus: "N/A",
    occupation: "",
    incomeSource: "N/A",
    monthlyIncome: "0",
    educationalStatus: "N/A",
    schoolType: "N/A",
    schoolLevel: "N/A",
    highestGrade: "N/A",
    idFront: null,
    idBack: null,
    idType: "Barangay ID",
    username: "",
    password: "",
    tenureStatus: "Owned",
    wallMaterial: "Concrete",
    roofMaterial: "G.I. Sheet",
    waterSource: "Maynilad",
    isIndigent: 0,
  });

  // Fetch purok/street locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await authService.getLocations();
        setPurokList(Array.isArray(res?.puroks) ? res.puroks : []);
        setAllStreets(Array.isArray(res?.streets) ? res.streets : []);
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    };
    fetchLocations();
  }, []);

  // Debounced household-head check whenever address fields change
  useEffect(() => {
    const checkAddress = async () => {
      if (formData.houseNumber && formData.street && formData.purok) {
        try {
          const res = await authService.checkHouseholdHead({
            houseNumber: formData.houseNumber,
            street: formData.street,
            purok: formData.purok,
          });
          setAddressExists(typeof res?.exists !== "undefined" ? !!res.exists : false);
        } catch {
          setAddressExists(false);
        }
      } else {
        setAddressExists(false);
      }
    };

    const timer = setTimeout(checkAddress, 500);
    return () => clearTimeout(timer);
  }, [formData.houseNumber, formData.street, formData.purok]);

  const handleChange = (e) => {
    // Support direct object passing (e.g. from handleFile in SignupForm)
    if (!e.target && e.name) {
      setFormData((prev) => ({ ...prev, [e.name]: e.value }));
      return;
    }

    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Strip non-digits and cap at 11 chars for contact numbers
    if (name === "contact") {
      const val = value.replace(/\D/g, "").substring(0, 11);
      setFormData((prev) => ({ ...prev, [name]: val }));
      return;
    }

    // Auto-calculate age from birthdate and auto-set Senior Citizen sector
    if (name === "birthdate") {
      if (!value) {
        setFormData((prev) => ({ ...prev, birthdate: "", age: "" }));
        return;
      }
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

      setFormData((prev) => ({
        ...prev,
        birthdate: value,
        age: isNaN(age) || age < 0 ? "" : age,
        sector: age >= 60 ? "3" : prev.sector,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitAuth = async () => {
    setLoading(true);
    try {
      const res = await authService.register(formData);
      if (res.success || res.trackingNumber) {
        setAuthSuccess({
          title: "Registration Submitted!",
          msg: "Application is now for review.",
          code: res.trackingNumber || res.tracking_number,
          resident: res.resident,
        });
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please check your data.";
      alert(msg);
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
      } catch {
        setSearchResult({ status: "NOT_FOUND", message: "Tracking number not found." });
      }
    } else {
      setSearchResult(null);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    submitAuth,
    loading,
    authSuccess,
    setAuthSuccess,
    trackingNum,
    handleTrackSearch,
    searchResult,
    purokList,
    allStreets,
    addressExists,
  };
};
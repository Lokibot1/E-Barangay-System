/**
 * useAuthLogic.js
 *
 * FIX: submitAdminEntry now accepts an optional second argument `overrides`.
 *
 * WHY: isIndigent is local state in SignupForm, not part of formData in this hook.
 * Before, SignupForm tried to inject it via handleChange + setTimeout — but
 * submitAdminEntry closes over the current formData, so the setTimeout-flushed
 * state update was never seen. The value was always 0 in the payload.
 *
 * NOW: SignupForm calls handleSubmit(e, { isIndigent }) directly. This hook
 * receives that as submitAdminEntry(e, { isIndigent }) and spreads it into
 * cleanData BEFORE calling authService.adminEntry(). Guaranteed current value.
 *
 * Usage from SignupForm:
 *   handleSubmit(e, { isIndigent: 1 })   ← staff + Head
 *   handleSubmit(e)                       ← public or non-Head staff
 */

import { useState, useEffect } from "react";
import { authService } from "../services/authService";

export const useAuthLogic = (navigate) => {
  const [loading,       setLoading]       = useState(false);
  const [authSuccess,   setAuthSuccess]   = useState(null);
  const [trackingNum,   setTrackingNum]   = useState("");
  const [searchResult,  setSearchResult]  = useState(null);
  const [purokList,     setPurokList]     = useState([]);
  const [allStreets,    setAllStreets]    = useState([]);

  const [addressExists,      setAddressExists]      = useState(false);
  const [householdHeadData,  setHouseholdHeadData]  = useState(null);
  const [addressSearch,      setAddressSearch]      = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "", suffix: "",
    birthdate: "", age: "", gender: "", sector: "",
    householdPosition: "", maritalStatus: "", nationality: "Filipino",
    residencyStatus: "", residencyStartDate: "",
    isVoter: false, birthRegistration: "Registered",
    purok: "", street: "", houseNumber: "",
    contact: "", email: "",
    employmentStatus: "N/A", occupation: "",
    incomeSource: "N/A", monthlyIncome: "0",
    educationalStatus: "N/A", schoolType: "N/A",
    schoolLevel: "N/A", highestGrade: "N/A",
    idFront: null, idBack: null, idType: "Barangay ID",
    username: "", password: "",
    tenureStatus: "Owned", wallMaterial: "Concrete",
    roofMaterial: "G.I. Sheet", waterSource: "Maynilad",
    isIndigent: 0,
  });

  // ── Fetch locations on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await authService.getLocations();
        if (res.puroks?.length)
          setPurokList(res.puroks.map((p) => ({ ...p, id: p.id.toString() })));
        if (res.streets?.length)
          setAllStreets(res.streets.map((s) => ({
            ...s,
            id: s.id.toString(),
            purok_id: s.purok_id?.toString() ?? null,
          })));
      } catch (err) { console.error("Failed to load locations:", err); }
    };
    fetchLocations();
  }, []);

  // ── Address autocomplete ──────────────────────────────────────────────────
  useEffect(() => {
    const search = async () => {
      if (addressSearch.length < 2) { setAddressSuggestions([]); return; }
      setIsSearchingAddress(true);
      try {
        const res = await authService.searchAddresses(addressSearch);
        setAddressSuggestions(res.data || []);
      } catch { console.error("Address search error"); }
      finally { setIsSearchingAddress(false); }
    };
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [addressSearch]);

  // ── Household head check ──────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      if (!formData.houseNumber || !formData.street || !formData.purok) return;
      try {
        const res = await authService.checkHouseholdHead({
          houseNumber: formData.houseNumber,
          street: formData.street,
          purok: formData.purok,
        });
        setAddressExists(!!res?.exists);
        setHouseholdHeadData(res?.exists ? (res.head || null) : null);
      } catch {
        setAddressExists(false);
        setHouseholdHeadData(null);
      }
    };
    const t = setTimeout(check, 500);
    return () => clearTimeout(t);
  }, [formData.houseNumber, formData.street, formData.purok]);

  const selectAddress = (addr) => {
    if (!addr.house_number) {
      setFormData((prev) => ({ ...prev, houseNumber: "", purok: "", street: "" }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      houseNumber: addr.house_number,
      purok:  addr.purok_id.toString(),
      street: addr.street_id.toString(),
    }));
    setAddressSearch(`${addr.house_number} ${addr.street_name}`);
    setAddressSuggestions([]);
  };

  const handleChange = (e) => {
    if (!e.target && e.name) { updateField(e.name, e.value); return; }
    const { name, value, type, checked, files } = e.target;
    if (type === "file")     { const f = files[0]; if (f) setFormData((p) => ({ ...p, [name]: f })); return; }
    if (type === "checkbox") { setFormData((p) => ({ ...p, [name]: checked })); return; }
    if (name === "purok")    { setFormData((p) => ({ ...p, purok: value, street: "" })); return; }
    updateField(name, value);
  };

  const updateField = (name, value) => {
    if (name === "contact") {
      setFormData((p) => ({ ...p, contact: value.replace(/\D/g, "").substring(0, 11) }));
      return;
    }
    if (name === "birthdate") {
      if (!value) { setFormData((p) => ({ ...p, birthdate: "", age: "" })); return; }
      const bd    = new Date(value);
      const today = new Date();
      let age     = today.getFullYear() - bd.getFullYear();
      const m     = today.getMonth() - bd.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
      setFormData((p) => ({
        ...p,
        birthdate: value,
        age:    isNaN(age) || age < 0 ? "" : age,
        sector: age >= 60 ? "3" : p.sector,
      }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ── STAFF DIRECT ENROLLMENT ───────────────────────────────────────────────
  /**
   * @param {Event}  e         - form submit event (optional)
   * @param {Object} overrides - values merged into payload before API call.
   *                             Used by SignupForm to pass { isIndigent }
   *                             synchronously, bypassing React state async flush.
   */
  const submitAdminEntry = async (e, overrides = {}) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const { age, ...baseData } = formData;

      // FIX: Merge overrides here — isIndigent is always the value at call time
      const cleanData = { ...baseData, ...overrides };

      const res = await authService.adminEntry(cleanData);

      const account = res.account || {};

      setAuthSuccess({
        id:    account.id            || "N/A",
        user:  account.username      || "N/A",
        pass:  account.temp_password || "N/A",
        token: account.token         || "",
        name:  res.resident?.name    || `${formData.firstName} ${formData.lastName}`.trim(),
        code:  account.id            || "N/A",
        type:  "ADMIN_ENTRY",
        title: "Resident Enrolled",
        msg:   "The resident account has been successfully created.",
      });
      return res;
    } catch (error) {
      alert(error?.message || "Failed to add resident.");
    } finally {
      setLoading(false);
    }
  };

  // ── PUBLIC REGISTRATION ───────────────────────────────────────────────────
  const submitAuth = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.register(formData);
      const trackingCode = res.trackingNumber || res.tracking_number || res.data?.tracking_number;
      if (res.success || trackingCode) {
        setAuthSuccess({
          id:    trackingCode,
          code:  trackingCode,
          name:  `${formData.firstName} ${formData.lastName}`,
          user:  "FOR_REVIEW",
          pass:  "PENDING",
          token: "",
          type:  "PUBLIC_REG",
          title: "Registration Sent",
          msg:   "Please save your tracking number below.",
        });
      }
    } catch (error) {
      alert(error?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Tracking search ───────────────────────────────────────────────────────
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
    formData, setFormData, handleChange,
    submitAuth, submitAdminEntry,
    loading, authSuccess, setAuthSuccess,
    trackingNum, handleTrackSearch, searchResult,
    purokList, allStreets,
    addressExists, householdHeadData,
    addressSearch, setAddressSearch,
    addressSuggestions, isSearchingAddress,
    selectAddress,
  };
};
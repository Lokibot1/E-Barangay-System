import { useState, useEffect, useRef, useCallback } from 'react';
import { verificationService } from '../../services/sub-system-1/verification';

const POLL_INTERVAL_MS = 10000;

export const useVerification = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  // loadData function
  const loadData = useCallback(async (showLoading = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (showLoading) setLoading(true); 
      setError(null);
      const data = await verificationService.getSubmissions();
      setSubmissions(data || []);
    } catch (err) {
      console.error("Hook Load Error:", err);
      setError(err.message || 'Failed to fetch submissions.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Update Status function
  const updateStatus = async (id, status, isIndigent = 0, additionalData = {}) => {
    const res = await verificationService.updateStatus(id, status, isIndigent, additionalData);
    if (res.success) {
      await loadData(false); // Silent refresh after manual update
    }
    return res;
  };


  useEffect(() => {
  const handleManualRefresh = () => {
    console.log("Notif clicked! Refreshing...");
    isFetchingRef.current = false; 
    loadData(true); 
  };

  window.addEventListener('refreshVerificationData', handleManualRefresh);
  return () => window.removeEventListener('refreshVerificationData', handleManualRefresh);
}, [loadData]);


  useEffect(() => { 
    loadData(true); 

    const interval = setInterval(() => {
      loadData(false); 
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadData]);

  return { 
    submissions, 
    loading, 
    error, 
    updateStatus, 
    refresh: () => loadData(true) 
  };
};
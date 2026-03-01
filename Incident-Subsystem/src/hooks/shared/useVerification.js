import { useState, useEffect, useRef, useCallback } from 'react';
import { verificationService } from '../../services/sub-system-1/verification';

const POLL_INTERVAL_MS = 10000;

export const useVerification = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const loadData = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (isInitial) setLoading(true); 
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

  const updateStatus = async (id, status) => {
    const res = await verificationService.updateStatus(id, status);
    if (res.success) {
      await loadData(false); // Silent refresh after update
    }
    return res;
  };

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
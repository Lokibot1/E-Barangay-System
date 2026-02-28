import { useState, useEffect, useRef } from 'react';
import { verificationService } from '../services/verification';

const POLL_INTERVAL_MS = 10000;

export const useVerification = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

 
  const loadData = async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (isInitial) setLoading(true); 
      setError(null);
      const data = await verificationService.getSubmissions();
      setSubmissions(data || []);
    } catch (error) {
      console.error("Hook Load Error:", error);
      setError(error.message || 'Failed to fetch submissions.');
    } finally {
      if (isInitial) setLoading(false);
      isFetchingRef.current = false;
    }
  };

  /**
   * Update resident status.
   * Returns the full server response (including accountDetails for Verified).
   */
  const updateStatus = async (id, status) => {
    const res = await verificationService.updateStatus(id, status);
    if (res.success) {
      await loadData(); // Refresh list after any status change
    }
    return res;
  };

  useEffect(() => { 
    // 1. Initial Load 
    loadData(true); 

    const interval = setInterval(() => {
      loadData(false); 
    }, POLL_INTERVAL_MS);

   
    return () => clearInterval(interval);
  }, []);

  return { submissions, loading, error, updateStatus, refresh: () => loadData(true) };
};

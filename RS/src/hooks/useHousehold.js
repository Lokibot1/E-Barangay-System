// hooks/useHouseholds.js
import { useState, useEffect } from 'react';
import { householdService } from '../services/household';

export const useHouseholds = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHouseholds = async () => {
    setLoading(true);
    const data = await householdService.getAll();
    setHouseholds(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  return { households, setHouseholds, loading, refresh: fetchHouseholds };
};
import { useState, useMemo, useEffect } from 'react';

export const useVerificationFilters = (submissions, itemsPerPage = 10) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const filteredData = useMemo(() => {
    const data = submissions || [];
    return data.filter(s => {
     
      const matchesTab = s.status?.toLowerCase() === activeTab?.toLowerCase();
      
      const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
  }, [submissions, activeTab, searchTerm]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    currentData,
    totalPages,
    totalItems
  };
};
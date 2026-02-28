import React, { useState, useMemo, useEffect } from 'react';
import { Printer, Home, Users, Landmark, MapPin } from 'lucide-react';
import HouseholdFilters from '../../components/sub-system-1/household/householdfilters';
import HouseholdTable from '../../components/sub-system-1/household/householdtable';
import HouseholdModal from '../../components/sub-system-1/household/householdmodal';
import Pagination from '../../components/sub-system-1/common/pagination';
import { useHouseholds } from '../../hooks/shared/useHousehold';
import { usePrinter } from '../../hooks/shared/usePrinter';
import themeTokens from '../../Themetokens';

const Households = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'blue'
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];

  const { households, loading } = useHouseholds();
  const { printTable } = usePrinter();

  const [searchTerm, setSearchTerm] = useState('');
  const [purokFilter, setPurokFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [materialFilter, setMaterialFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  const stats = useMemo(() => {
    if (!households || households.length === 0) {
      return { total: 0, avgSize: 0, indigents: 0, density: 'N/A' };
    }
    const total = households.length;
    const totalMembers = households.reduce((sum, h) => sum + (Number(h.members) || 0), 0);
    const indigents = households.filter(h => Number(h.is_indigent) === 1).length;
    const purokCounts = households.reduce((acc, h) => {
      if (h.purok) acc[h.purok] = (acc[h.purok] || 0) + 1;
      return acc;
    }, {});
    const topPurok = Object.entries(purokCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    return {
      total,
      avgSize: (totalMembers / total).toFixed(1),
      indigents,
      density: `Purok ${topPurok}`,
    };
  }, [households]);

  const filtered = useMemo(() => {
    return households.filter(h => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (h.head?.toLowerCase() || '').includes(searchLower) ||
        (h.id?.toLowerCase() || '').includes(searchLower);
      const matchesPurok = purokFilter === 'All' || String(h.purok) === purokFilter;
      const matchesStatus = statusFilter === 'All' || String(h.is_indigent) === statusFilter;
      const matchesMaterial = materialFilter === 'All' || h.wall_material === materialFilter;
      return matchesSearch && matchesPurok && matchesStatus && matchesMaterial;
    });
  }, [households, searchTerm, purokFilter, statusFilter, materialFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, purokFilter, statusFilter, materialFilter]);

  if (loading)
    return (
      <div className={`p-6 sm:p-8 ${t.subtleText} font-kumbh`}>
        Loading households…
      </div>
    );

  const statCards = [
    {
      icon: <Home size={20} className="text-emerald-600 mb-2" />,
      label: 'Total Households',
      value: stats.total,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      labelColor: 'text-emerald-600',
    },
    {
      icon: <Users size={20} className="text-blue-600 mb-2" />,
      label: 'Avg Family Size',
      value: stats.avgSize,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      labelColor: 'text-blue-600',
    },
    {
      icon: <Landmark size={20} className="text-amber-600 mb-2" />,
      label: 'Indigent Families',
      value: stats.indigents,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      labelColor: 'text-amber-600',
    },
    {
      icon: <MapPin size={20} className="text-purple-600 mb-2" />,
      label: 'Highest Density',
      value: stats.density,
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      labelColor: 'text-purple-600',
      small: true,
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>
          Household Registry
        </h1>
        <p className={`text-xs font-kumbh ${t.subtleText} uppercase tracking-widest mt-1`}>
          Family Units and Housing Status
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div
            key={i}
            className={`${s.bg} p-5 rounded-2xl border ${s.border}`}
          >
            {s.icon}
            <p className={`text-[10px] font-spartan font-bold ${s.labelColor} uppercase`}>
              {s.label}
            </p>
            <p className={`${s.small ? 'text-xl' : 'text-3xl'} font-spartan font-bold ${t.cardText}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <HouseholdFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        purokFilter={purokFilter}
        setPurokFilter={setPurokFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        materialFilter={materialFilter}
        setMaterialFilter={setMaterialFilter}
        totalResults={filtered.length}
        t={t}
      />

      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
        <HouseholdTable
          households={currentData}
          onView={(h) => {
            setSelectedHousehold(h);
            setIsModalOpen(true);
          }}
          t={t}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        t={t}
      />

      {isModalOpen && (
        <HouseholdModal
          isOpen={isModalOpen}
          data={selectedHousehold}
          t={t}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedHousehold(null);
          }}
        />
      )}
    </div>
  );
};

export default Households;

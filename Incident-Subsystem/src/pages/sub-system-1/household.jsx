import React, { useState, useMemo, useEffect } from 'react';
import { Printer, Home, Users, Landmark, MapPin } from 'lucide-react';
import HouseholdFilters from '../../components/sub-system-1/household/householdfilters';
import HouseholdTable from '../../components/sub-system-1/household/householdtable';
import HouseholdModal from '../../components/sub-system-1/household/householdmodal';
import Pagination from '../../components/sub-system-1/common/pagination';
import { useHouseholds } from '../../hooks/shared/useHousehold';
import { usePrinter } from '../../hooks/shared/usePrinter'; 

const Households = () => {
    const { households, loading } = useHouseholds();
    const { printTable } = usePrinter(); 
    
    const [searchTerm, setSearchTerm] = useState("");
    const [purokFilter, setPurokFilter] = useState("All")
    const [statusFilter, setStatusFilter] = useState("All");
    const [materialFilter, setMaterialFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHousehold, setSelectedHousehold] = useState(null);

    // 1. STATS LOGIC (Optimized with useMemo)
    const stats = useMemo(() => {
        if (!households || households.length === 0) {
            return { total: 0, avgSize: 0, indigents: 0, density: 'N/A' };
        }
        const total = households.length;
        const totalMembers = households.reduce((sum, h) => sum + (Number(h.members) || 0), 0);
        const indigents = households.filter(h => Number(h.is_indigent) === 1).length;
        const purokCounts = households.reduce((acc, h) => {
            if(h.purok) acc[h.purok] = (acc[h.purok] || 0) + 1;
            return acc;
        }, {});
        const topPurok = Object.entries(purokCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A';
        return { total, avgSize: (totalMembers / total).toFixed(1), indigents, density: `Purok ${topPurok}` };
    }, [households]);

    // 2. FILTERING LOGIC
    const filtered = useMemo(() => {
        return households.filter(h => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (h.head?.toLowerCase() || "").includes(searchLower) || 
                                 (h.id?.toLowerCase() || "").includes(searchLower);
            const matchesPurok = purokFilter === "All" || String(h.purok) === purokFilter;
            const matchesStatus = statusFilter === "All" || String(h.is_indigent) === statusFilter;
            const matchesMaterial = materialFilter === "All" || h.wall_material === materialFilter;

            return matchesSearch && matchesPurok && matchesStatus && matchesMaterial;
        });
    }, [households, searchTerm, purokFilter, statusFilter, materialFilter]);

    // 3. PAGINATION
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, purokFilter, statusFilter, materialFilter]);

    if (loading) return <div className="p-4">Loading households...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Household Registry</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Family Units and Housing Status</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <Home size={20} className="text-emerald-600 mb-2" />
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Total Households</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <Users size={20} className="text-blue-600 mb-2" />
                    <p className="text-[10px] font-black text-blue-600 uppercase">Avg Family Size</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.avgSize}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
                    <Landmark size={20} className="text-amber-600 mb-2" />
                    <p className="text-[10px] font-black text-amber-600 uppercase">Indigent Families</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.indigents}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <MapPin size={20} className="text-purple-600 mb-2" />
                    <p className="text-[10px] font-black text-purple-600 uppercase">Highest Density</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{stats.density}</p>
                </div>
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
            />

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <HouseholdTable
                    data={currentData}
                    onEdit={(h) => { setSelectedHousehold(h); setIsModalOpen(true); }}
                />
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            {isModalOpen && (
                <HouseholdModal
                    household={selectedHousehold}
                    onClose={() => { setIsModalOpen(false); setSelectedHousehold(null); }}
                />
            )}
        </div>
    );
};

export default Households;

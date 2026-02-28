import React, { useState, useMemo, useEffect } from 'react';
import { Printer, Home, Users, Landmark, MapPin } from 'lucide-react';
import HouseholdFilters from '../components/household/householdfilters';
import HouseholdTable from '../components/household/householdtable';
import HouseholdModal from '../components/household/householdmodal';
import Pagination from '../components/common/pagination';
import { useHouseholds } from '../hooks/useHousehold';
import { usePrinter } from '../hooks/usePrinter'; 

const Households = () => {
    const { households, loading } = useHouseholds();
    const { printTable } = usePrinter(); 
    
    const [searchTerm, setSearchTerm] = useState("");
    const [purokFilter, setPurokFilter] = useState("All");
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

    // 3. UPDATED PRINT HANDLE
    const handlePrint = () => {
        const columns = [
            { header: "No.", key: "no", width: "40px", align: "center" }, // Added auto-numbering
            { header: 'Household ID', key: 'id', width: "100px" },
            { header: 'Head of Family', key: 'head', width: "180px" },
            { header: 'Purok', key: 'display_purok', align: "center" },
            { header: 'Status', key: 'display_status', align: "center" },
            { header: 'Material', key: 'wall_material' },
            { header: 'Members', key: 'members', width: "70px", align: "center" }
        ];

        const dataToPrint = filtered.map(h => ({
            ...h,
            display_purok: h.purok ? `Purok ${h.purok}` : 'N/A',
            display_status: Number(h.is_indigent) === 1 ? 'INDIGENT' : 'GENERAL',
        }));

        // Pagsasama ng filters para sa Subtitle ng Report
        const activeStatus = statusFilter === '1' ? 'Indigent' : statusFilter === '0' ? 'General' : 'All';
        const subtitle = `Purok: ${purokFilter} | Status: ${activeStatus} | Material: ${materialFilter}`;
        
        printTable("Barangay Household Masterlist", columns, dataToPrint, subtitle);
    };

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, purokFilter, statusFilter, materialFilter]);

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">Household Registry</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Housing & Family Records</p>
                </div>
                <button 
                    onClick={handlePrint} 
                    disabled={filtered.length === 0}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:opacity-90 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                    <Printer size={16} /> Print Masterlist
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Home />} label="Total Households" value={stats.total} color="text-slate-600" />
                <StatCard icon={<Users />} label="Avg. Family Size" value={`${stats.avgSize} Pers.`} color="text-blue-500" />
                <StatCard icon={<Landmark />} label="Indigent Families" value={stats.indigents} color="text-rose-500" />
                <StatCard icon={<MapPin />} label="Densest Area" value={stats.density} color="text-amber-500" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                <HouseholdFilters 
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    purokFilter={purokFilter} setPurokFilter={setPurokFilter}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    materialFilter={materialFilter} setMaterialFilter={setMaterialFilter}
                    totalResults={filtered.length}
                />
                
                {loading ? (
                    <div className="p-20 text-center font-bold text-emerald-600 tracking-[4px] animate-pulse uppercase">Syncing Registry...</div>
                ) : (
                    <HouseholdTable 
                        households={currentItems} 
                        onView={(item) => { setSelectedHousehold(item); setIsModalOpen(true); }} 
                    />
                )}

                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    <Pagination 
                        currentPage={currentPage} totalPages={totalPages} 
                        onPageChange={setCurrentPage} totalItems={filtered.length} 
                        itemsPerPage={itemsPerPage} 
                    />
                </div>
            </div>

            <HouseholdModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedHousehold} />
        </div>
    );
};

// Sub-component for Stats to keep it clean
const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-all">
        <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${color}`}>{icon}</div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none">{value}</h3>
        </div>
    </div>
);

export default Households;
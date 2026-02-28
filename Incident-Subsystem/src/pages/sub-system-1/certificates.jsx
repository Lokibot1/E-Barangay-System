import React, { useState, useMemo } from 'react';
import { Search, FileText, UserCheck, ArrowRight, Printer } from 'lucide-react';
import { useResidents } from '../../hooks/shared/useResidents';
import { usePrinter } from '../../hooks/shared/usePrinter';

const Certificates = () => {
  const { residents, loading } = useResidents();
  const { printCertificate } = usePrinter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState("");

  const docTypes = [
    { id: 'clearance', label: 'Barangay Clearance' },
    { id: 'indigency', label: 'Certificate of Indigency' },
    { id: 'residency', label: 'Certificate of Residency' },
    { id: 'jobseeker', label: 'First Time Jobseeker (RA 11261)' },
  ];

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return residents.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, residents]);

  const handlePrintCert = () => {
    if (!selectedResident || !selectedDoc) return;
    printCertificate(selectedResident, selectedDoc);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Document Issuance</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Generate official barangay certifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[2px] mb-4 block">1. Identify Resident (RBI Search)</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type resident name..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-emerald-500/20 transition-all"
              />
            </div>

            {searchResults.length > 0 && !selectedResident && (
              <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                {searchResults.map(r => (
                  <button 
                    key={r.id}
                    onClick={() => { setSelectedResident(r); setSearchTerm(""); }}
                    className="w-full flex items-center justify-between p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-none"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{r.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">{r.address}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            )}

            {selectedResident && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none text-left">Selected Beneficiary</p>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase">{selectedResident.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500">Purok {selectedResident.purok} | {selectedResident.sector}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedResident(null); setSelectedDoc(""); }}
                  className="text-[10px] font-black text-red-500 uppercase hover:underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
            {selectedDoc ? (
              <div className="space-y-4">
                <FileText size={48} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Preview Ready: {selectedDoc}</p>
                <button 
                  onClick={handlePrintCert}
                  className="inline-flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  <Printer size={16} /> Generate & Print
                </button>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[3px]">Preview Area</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all ${!selectedResident ? 'opacity-50 pointer-events-none scale-95' : 'opacity-100'}`}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 block">2. Select Document Type</label>
            <div className="grid grid-cols-1 gap-3">
              {docTypes.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc.label)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group
                    ${selectedDoc === doc.label 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                      : 'border-slate-50 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800'}`}
                >
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedDoc === doc.label ? 'text-emerald-600' : 'text-slate-400'}`}>Official</p>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{doc.label}</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${selectedDoc === doc.label ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
            <span className="font-black uppercase">Note:</span> Only verified residents from the RBI can be issued certificates automatically.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;

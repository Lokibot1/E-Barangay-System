import React, { useState, useMemo, useEffect } from 'react';
import { Search, FileText, UserCheck, ArrowRight, Printer } from 'lucide-react';
import { useResidents } from '../../hooks/shared/useResidents';
import { usePrinter } from '../../hooks/shared/usePrinter';
import themeTokens from '../../Themetokens';

const Certificates = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'blue'
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];

  const { residents, loading } = useResidents();
  const { printCertificate } = usePrinter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState('');

  const docTypes = [
    { id: 'clearance',  label: 'Barangay Clearance' },
    { id: 'indigency',  label: 'Certificate of Indigency' },
    { id: 'residency',  label: 'Certificate of Residency' },
    { id: 'jobseeker',  label: 'First Time Jobseeker (RA 11261)' },
  ];

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return residents
      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);
  }, [searchTerm, residents]);

  const handlePrintCert = () => {
    if (!selectedResident || !selectedDoc) return;
    printCertificate(selectedResident, selectedDoc);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>
          Document Issuance
        </h1>
        <p className={`text-xs font-kumbh ${t.subtleText} uppercase tracking-widest mt-1`}>
          Generate official barangay certifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Step 1 — Search resident */}
          <div className={`${t.cardBg} p-6 rounded-2xl border ${t.cardBorder} shadow-sm`}>
            <label className="text-[10px] font-spartan font-bold text-emerald-600 uppercase tracking-[2px] mb-4 block">
              1. Identify Resident (RBI Search)
            </label>
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.subtleText}`} size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type resident name…"
                className={`w-full pl-12 pr-4 py-4 ${t.inlineBg} ${t.inputText} border-none rounded-xl text-sm font-kumbh font-bold outline-none focus:ring-2 ${t.primaryRing} transition-all`}
              />
            </div>

            {searchResults.length > 0 && !selectedResident && (
              <div className={`mt-2 ${t.cardBg} border ${t.cardBorder} rounded-2xl overflow-hidden shadow-xl`}>
                {searchResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedResident(r); setSearchTerm(''); }}
                    className={`w-full flex items-center justify-between p-4 hover:${t.primaryLight} transition-colors border-b ${t.cardBorder} last:border-none`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className={`h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-spartan font-bold text-xs uppercase`}>
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-kumbh font-bold ${t.cardText}`}>{r.name}</p>
                        <p className={`text-[10px] font-kumbh ${t.subtleText} uppercase`}>{r.address}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className={t.subtleText} />
                  </button>
                ))}
              </div>
            )}

            {selectedResident && (
              <div className={`mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-spartan font-bold text-emerald-600 uppercase tracking-widest leading-none text-left">
                      Selected Beneficiary
                    </p>
                    <h3 className={`text-lg font-spartan font-bold ${t.cardText} uppercase`}>
                      {selectedResident.name}
                    </h3>
                    <p className={`text-[10px] font-kumbh font-bold ${t.subtleText}`}>
                      Purok {selectedResident.purok} | {selectedResident.sector}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedResident(null); setSelectedDoc(''); }}
                  className="text-[10px] font-spartan font-bold text-red-500 uppercase hover:underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Preview area */}
          <div className={`${t.inlineBg} border-2 border-dashed ${t.cardBorder} rounded-2xl p-12 text-center`}>
            {selectedDoc ? (
              <div className="space-y-4">
                <FileText size={48} className={`mx-auto ${t.subtleText}`} />
                <p className={`text-sm font-kumbh font-bold ${t.subtleText} uppercase tracking-widest`}>
                  Preview Ready: {selectedDoc}
                </p>
                <button
                  onClick={handlePrintCert}
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${t.primaryGrad} text-white px-8 py-3 rounded-xl font-kumbh font-bold text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all`}
                >
                  <Printer size={16} /> Generate & Print
                </button>
              </div>
            ) : (
              <p className={`text-xs font-kumbh font-bold ${t.subtleText} uppercase tracking-[3px]`}>
                Preview Area
              </p>
            )}
          </div>
        </div>

        {/* Step 2 — Document type */}
        <div className="space-y-4">
          <div className={`${t.cardBg} p-6 rounded-2xl border ${t.cardBorder} shadow-sm transition-all ${!selectedResident ? 'opacity-50 pointer-events-none scale-95' : ''}`}>
            <label className="text-[10px] font-spartan font-bold text-slate-400 uppercase tracking-[2px] mb-4 block">
              2. Select Document Type
            </label>
            <div className="grid grid-cols-1 gap-3">
              {docTypes.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc.label)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
                    ${selectedDoc === doc.label
                      ? `border-emerald-500 bg-emerald-50`
                      : `${t.cardBorder} hover:border-emerald-300`}`}
                >
                  <div>
                    <p className={`text-[10px] font-spartan font-bold uppercase tracking-widest mb-1 ${
                      selectedDoc === doc.label ? 'text-emerald-600' : t.subtleText
                    }`}>
                      Official
                    </p>
                    <p className={`text-sm font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>
                      {doc.label}
                    </p>
                  </div>
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    selectedDoc === doc.label ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <div className={`bg-amber-50 p-4 rounded-xl border border-amber-100 text-[10px] font-kumbh text-amber-700 font-bold leading-relaxed`}>
            <span className="font-spartan uppercase">Note:</span> Only verified residents from
            the RBI can be issued certificates automatically.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;

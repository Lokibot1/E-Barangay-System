import React, { useState } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { 
  UserCheck, 
  ShieldAlert, 
  FileSearch, 
  User, 
  Smartphone, 
  MapPin, 
  IdCard, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useVerification } from '../hooks/useVerification'; 

const QRScanner = () => {
  const { submissions } = useVerification(); 
  const [foundResident, setFoundResident] = useState(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setIsError(false);
    setFoundResident(null);

    const html5QrCode = new Html5Qrcode("reader");
    try {
      const result = await html5QrCode.scanFile(file, true);
      
    
      const qrText = result.toUpperCase();
      const extractedBarangayId = qrText.match(/BGN-\d+/)?.[0] || null;

      const matchedRes = submissions.find((res) => {
        const resName = res.name?.toUpperCase();
        const resId = res.barangay_id?.toUpperCase();
        const isVerified = (res.status || "").toUpperCase() === "VERIFIED";

        if (!isVerified) return false;
        if (extractedBarangayId && resId) return resId === extractedBarangayId;
        return (resName && qrText.includes(resName)) || (resId && qrText.includes(resId));
      });

      if (matchedRes) {
        setFoundResident(matchedRes);
      } else {
        setIsError(true);
      }
    } catch (err) {
      console.error("QR Scan Error:", err);
      setIsError(true);
    } finally {
      setLoading(false);
    
      e.target.value = ""; 
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
          QR Verification Scanner
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[2px]">
            Barangay Security Subsystem v1.0
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* LEFT: UPLOAD BOX */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
              </div>
            )}
            
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6">
              <FileSearch className="text-emerald-600" size={36} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Scan Resident QR</h3>
            <p className="text-xs text-slate-400 mb-8 max-w-[220px]">
              Upload the official digital QR code to verify resident credentials in the database.
            </p>
            
            <input type="file" accept="image/*" onChange={handleFileChange} id="qr-upload" className="hidden" />
            <label 
              htmlFor="qr-upload"
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 hover:scale-105 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Upload QR Image
            </label>
            <div id="reader" style={{ display: 'none' }}></div>
          </div>

          <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 flex gap-4">
            <AlertCircle className="text-slate-400 shrink-0" size={20} />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Note: The scanner looks for a match in the <span className="font-bold text-slate-700 dark:text-slate-200 underline">Verified Residents</span> list. Make sure the resident is already approved.
            </p>
          </div>
        </div>

        {/* RIGHT: DYNAMIC RESULT */}
        <div className="relative min-h-[420px]">
          {foundResident ? (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
              <div className="bg-emerald-600 p-8 text-white relative">
                <div className="absolute top-4 right-6 opacity-20">
                  <UserCheck size={80} />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase opacity-80 tracking-widest mb-1">Database Match Found</p>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{foundResident.name}</h2>
                </div>
              </div>

              <div className="p-8 space-y-4">
                <ScannerRow icon={IdCard} label="Barangay ID" value={foundResident.barangay_id || 'NO_ID_RECORDED'} highlight />
                <ScannerRow icon={Smartphone} label="Contact No." value={foundResident.details?.contact || foundResident.contact || 'N/A'} />
                <ScannerRow icon={MapPin} label="Resident Status" value={foundResident.status?.toUpperCase()} />
                
                <div className="pt-6 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Identity Verified</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="bg-rose-50 dark:bg-rose-500/5 rounded-[3rem] p-12 border-2 border-rose-200 dark:border-rose-900/30 flex flex-col items-center text-center animate-in shake duration-500">
              <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="text-rose-600" size={40} />
              </div>
              <h3 className="text-xl font-black text-rose-600 uppercase tracking-tight">Access Denied</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                The scanned QR code is either invalid or the resident is not yet verified in the system.
              </p>
              <button 
                onClick={() => setIsError(false)}
                className="mt-6 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 underline"
              >
                Clear Results
              </button>
            </div>
          ) : (
            <div className="h-full bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-slate-300">
              <div className="relative">
                <User size={80} className="opacity-10" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-0.5 bg-emerald-500/30 animate-pulse"></div>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[3px] opacity-30 mt-4">Waiting for scan...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Sub-component
const ScannerRow = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
        <Icon size={14} className="text-slate-400" />
      </div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className={`text-xs font-bold font-mono ${highlight ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
      {value}
    </span>
  </div>
);

export default QRScanner;

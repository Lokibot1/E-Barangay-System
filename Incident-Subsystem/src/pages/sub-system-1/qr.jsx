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
import { useVerification } from '../../hooks/shared/useVerification'; 

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
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">QR Code Scanner</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Verify Resident Identity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileSearch size={20} className="text-blue-600" />
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Scan QR Code</h2>
          </div>

          <div id="reader" className="w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 min-h-96 flex items-center justify-center">
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-center">
                <Smartphone size={48} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Click to upload QR image</p>
              </div>
            </label>
          </div>

          {loading && (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="space-y-4">
          {!foundResident && !isError && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
              <FileSearch size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No result yet</p>
              <p className="text-xs text-slate-400 mt-1">Upload a QR code to get started</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle size={20} className="text-red-600" />
                <h3 className="font-black text-red-700 dark:text-red-400">Invalid or Unverified</h3>
              </div>
              <p className="text-sm text-red-600 dark:text-red-300 mb-3">The QR code could not be found in our verified resident database.</p>
              <button 
                onClick={() => setIsError(false)}
                className="text-xs font-bold text-red-600 hover:text-red-700 uppercase"
              >
                Try Again
              </button>
            </div>
          )}

          {foundResident && (
            <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-800 p-6 rounded-3xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 size={24} className="text-emerald-600" />
                <h3 className="font-black text-emerald-700 dark:text-emerald-400 uppercase">Verified Resident</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <span className="font-bold text-slate-900 dark:text-white">{foundResident.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard size={16} className="text-slate-400" />
                  <span className="font-bold text-slate-900 dark:text-white">{foundResident.barangay_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="font-bold text-slate-900 dark:text-white">{foundResident.address}</span>
                </div>
              </div>

              <button 
                onClick={() => setFoundResident(null)}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 rounded-lg transition-colors"
              >
                Scan Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;

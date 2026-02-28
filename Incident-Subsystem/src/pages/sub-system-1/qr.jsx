import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  FileSearch, User, Smartphone, MapPin, IdCard, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useVerification } from '../../hooks/shared/useVerification';
import themeTokens from '../../Themetokens';

const QRScanner = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'blue'
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];

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

    const html5QrCode = new Html5Qrcode('reader');
    try {
      const result = await html5QrCode.scanFile(file, true);
      const qrText = result.toUpperCase();
      const extractedBarangayId = qrText.match(/BGN-\d+/)?.[0] || null;

      const matchedRes = submissions.find((res) => {
        const resName = res.name?.toUpperCase();
        const resId = res.barangay_id?.toUpperCase();
        const isVerified = (res.status || '').toUpperCase() === 'VERIFIED';

        if (!isVerified) return false;
        if (extractedBarangayId && resId) return resId === extractedBarangayId;
        return (resName && qrText.includes(resName)) || (resId && qrText.includes(resId));
      });

      if (matchedRes) {
        setFoundResident(matchedRes);
      } else {
        setIsError(true);
      }
    } catch {
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-20 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>
          QR Code Scanner
        </h1>
        <p className={`text-xs font-kumbh ${t.subtleText} uppercase tracking-widest mt-1`}>
          Verify Resident Identity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className={`${t.cardBg} p-6 rounded-2xl border ${t.cardBorder} shadow-sm space-y-4`}>
          <div className="flex items-center gap-2 mb-4">
            <FileSearch size={20} className={t.primaryText} />
            <h2 className={`text-sm font-spartan font-bold ${t.cardText} uppercase tracking-widest`}>
              Scan QR Code
            </h2>
          </div>

          <div
            id="reader"
            className={`w-full rounded-2xl overflow-hidden ${t.inlineBg} min-h-96 flex items-center justify-center`}
          >
            <label
              className={`flex flex-col items-center justify-center w-full h-full cursor-pointer hover:opacity-80 transition-opacity`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-center">
                <Smartphone size={48} className={`mx-auto ${t.subtleText} mb-2`} />
                <p className={`text-sm font-kumbh font-bold ${t.subtleText}`}>
                  Click to upload QR image
                </p>
              </div>
            </label>
          </div>

          {loading && (
            <div className="flex justify-center">
              <div
                className="w-8 h-8 border-4 rounded-full animate-spin"
                style={{ borderColor: '#e2e8f0', borderTopColor: '#3b82f6' }}
              />
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="space-y-4">
          {!foundResident && !isError && (
            <div className={`${t.inlineBg} p-8 rounded-2xl border-2 border-dashed ${t.cardBorder} text-center`}>
              <FileSearch size={40} className={`mx-auto ${t.subtleText} mb-3`} />
              <p className={`text-sm font-kumbh font-bold ${t.subtleText}`}>No result yet</p>
              <p className={`text-xs font-kumbh ${t.subtleText} mt-1`}>
                Upload a QR code to get started
              </p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle size={20} className="text-red-600" />
                <h3 className="font-spartan font-bold text-red-700">
                  Invalid or Unverified
                </h3>
              </div>
              <p className="text-sm font-kumbh text-red-600 mb-3">
                The QR code could not be found in our verified resident database.
              </p>
              <button
                onClick={() => setIsError(false)}
                className="text-xs font-kumbh font-bold text-red-600 hover:text-red-700 uppercase"
              >
                Try Again
              </button>
            </div>
          )}

          {foundResident && (
            <div className={`${t.cardBg} border-2 border-emerald-200 p-6 rounded-2xl shadow-lg`}>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 size={24} className="text-emerald-600" />
                <h3 className="font-spartan font-bold text-emerald-700 uppercase">
                  Verified Resident
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className={t.subtleText} />
                  <span className={`font-kumbh font-bold ${t.cardText}`}>{foundResident.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard size={16} className={t.subtleText} />
                  <span className={`font-kumbh font-bold ${t.cardText}`}>{foundResident.barangay_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className={t.subtleText} />
                  <span className={`font-kumbh font-bold ${t.cardText}`}>{foundResident.address}</span>
                </div>
              </div>

              <button
                onClick={() => setFoundResident(null)}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-kumbh font-bold py-2 rounded-lg transition-colors"
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

/**
 * VerificationSuccessModal.jsx
 * FIXED: Added onMinimize prop — X button minimizes instead of destroying data.
 * FIXED: Separate "Done / Leave Page" button for intentional full close.
 * FIXED: QR URL construction uses encodeURIComponent for safety.
 */

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck, Smartphone, Camera, User, Key,
  IdCard, AlertTriangle, Download, Minimize2, LogOut,
} from 'lucide-react';
import ModalWrapper from '../../common/ModalWrapper';
import { VERIFY_URL } from '../../../../config/api';

const accentBoxMap = {
  modern: 'bg-blue-600',
  blue:   'bg-blue-600',
  purple: 'bg-purple-600',
  green:  'bg-green-600',
  dark:   'bg-slate-600',
};
const accentBorderMap = {
  modern: 'border-blue-500 bg-blue-50/30',
  blue:   'border-blue-500 bg-blue-50/30',
  purple: 'border-purple-500 bg-purple-50/30',
  green:  'border-green-500 bg-green-50/30',
  dark:   'border-slate-500 bg-slate-700/60',
};
const accentTextMap = {
  modern: 'text-blue-600',
  blue:   'text-blue-600',
  purple: 'text-purple-600',
  green:  'text-green-600',
  dark:   'text-slate-200',
};
const subtleIconMap = {
  modern: 'text-blue-500',
  blue:   'text-blue-500',
  purple: 'text-purple-500',
  green:  'text-green-500',
  dark:   'text-slate-300',
};

const VerificationSuccessModal = ({
  isOpen,
  onClose,
  onMinimize,   // NEW — collapses to floating card without losing data
  data,
  t,
  currentTheme = 'modern',
}) => {
  if (!data) return null;

  const accentBoxClass    = accentBoxMap[currentTheme]    || accentBoxMap.modern;
  const accentBorderClass = accentBorderMap[currentTheme] || accentBorderMap.modern;
  const accentTextClass   = accentTextMap[currentTheme]   || accentTextMap.modern;
  const subtleIconClass   = subtleIconMap[currentTheme]   || subtleIconMap.modern;

  const hasValidQR = data.user && data.user !== 'N/A' && data.token;
  const qrUrl = hasValidQR
    ? `${VERIFY_URL}/verify/${encodeURIComponent(data.user)}/${data.token}`
    : `${VERIFY_URL}/verify/pending/no-token`;

  const downloadQR = () => {
    const svg = document.getElementById('resident-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas  = document.createElement('canvas');
    const ctx     = canvas.getContext('2d');
    const img     = new Image();
    img.onload = () => {
      canvas.width  = 1000;
      canvas.height = 1000;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const qrSize = 800;
      const margin = (1000 - qrSize) / 2;
      ctx.drawImage(img, margin, margin, qrSize, qrSize);
      const link = document.createElement('a');
      link.download = `QR-${data.id}-${data.name}.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Intentional close with confirmation
  const handleFullClose = () => {
    if (window.confirm('Have you saved the credentials? This temporary password will be hidden once you leave.')) {
      onClose();
    }
  };

  // Minimize without confirmation — data is preserved in parent
  const handleMinimize = () => {
    if (onMinimize) onMinimize();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleMinimize}   // Clicking backdrop / ESC = minimize, not destroy
      t={t}
      title={
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl shadow-lg ${accentBoxClass}`}>
            <ShieldCheck className="text-white" size={20} />
          </div>
          <h2 className={`text-sm font-black uppercase tracking-widest ${t?.cardText} ${accentTextClass}`}>
            Registration Successful
          </h2>
        </div>
      }
      // Pass extra header actions via extraHeaderActions if ModalWrapper supports it,
      // otherwise we add the minimize + close buttons inside the body below.
    >
      {/* Custom action row — minimize and full-close */}
      <div className="flex justify-end gap-2 mb-4 -mt-2">
        <button
          onClick={handleMinimize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Minimize — you can restore this later"
        >
          <Minimize2 size={12} /> Minimize
        </button>
        <button
          onClick={handleFullClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 transition-colors"
          title="Close and go back to Residents list"
        >
          <LogOut size={12} /> Done
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-stretch p-2">

        {/* LEFT: QR CODE */}
        <div className={`w-full md:w-2/5 flex flex-col items-center justify-center p-6 ${t?.inlineBg} rounded-[2.5rem] border-2 ${t?.cardBorder} shadow-inner`}>
          <div className="bg-white p-4 rounded-3xl shadow-2xl mb-4 border border-slate-100">
            {hasValidQR ? (
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to preview verification page"
              >
                <QRCodeSVG
                  id="resident-qr"
                  value={qrUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </a>
            ) : (
              <div className="w-[200px] h-[200px] flex flex-col items-center justify-center bg-slate-100 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase text-center px-4">
                  QR unavailable — token not yet generated
                </p>
              </div>
            )}
          </div>

          <button
            onClick={downloadQR}
            disabled={!hasValidQR}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg mb-4 w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} /> Download QR File
          </button>

          <div className="text-center">
            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Official Resident ID</p>
            <p className="text-[9px] text-slate-400 font-mono mt-1 font-bold">SCAN TO VERIFY IDENTITY</p>
          </div>
        </div>

        {/* RIGHT: CREDENTIALS */}
        <div className="w-full md:w-3/5 space-y-3">
          <CredentialBox label="FULL LEGAL NAME"    value={data.name} icon={User}       t={t} currentTheme={currentTheme} />
          <CredentialBox label="UNIQUE BARANGAY ID" value={data.id}   icon={IdCard}     highlight t={t} currentTheme={currentTheme} />
          <CredentialBox label="LOGIN USERNAME"      value={data.user} icon={Smartphone} t={t} currentTheme={currentTheme} />
          <CredentialBox label="TEMPORARY PASSWORD" value={data.pass} icon={Key}        isSecret t={t} currentTheme={currentTheme} />

          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] font-bold text-amber-900 leading-snug uppercase">
                Reminder: Resident must change this password immediately after first login.
              </p>
            </div>
            <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl ${accentBoxClass}`}>
              <Camera className="text-white shrink-0" size={18} />
              <p className="text-[10px] font-black text-white uppercase">
                Staff: Ensure resident has copied or photographed this screen before closing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

const CredentialBox = ({ label, value, icon: Icon, highlight, isSecret, t, currentTheme = 'modern' }) => {
  const accentBorderClass = accentBorderMap[currentTheme] || accentBorderMap.modern;
  const accentTextClass   = accentTextMap[currentTheme]   || accentTextMap.modern;
  const subtleIconClass   = subtleIconMap[currentTheme]   || subtleIconMap.modern;

  return (
    <div className={`p-3 rounded-xl border ${highlight ? accentBorderClass : `${t?.cardBorder} ${t?.cardBg}`} shadow-sm`}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={12} className={highlight ? accentTextClass : subtleIconClass} />}
        <span className={`text-[9px] font-black uppercase tracking-widest ${t?.subtleText}`}>{label}</span>
      </div>
      <p className={`text-sm font-mono font-bold ${highlight ? accentTextClass : t?.cardText} ${
        isSecret ? 'bg-amber-100 px-2 py-0.5 rounded text-amber-700 border border-amber-200' : ''
      }`}>
        {value || '---'}
      </p>
    </div>
  );
};

export default VerificationSuccessModal;
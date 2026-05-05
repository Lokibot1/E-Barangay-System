/**
 * VerificationSuccessModal.jsx
 * FIXED: Added onMinimize prop so closing via backdrop or ESC minimizes instead of discarding data.
 * FIXED: Replaced the native browser confirm dialog with an in-app confirmation card.
 * FIXED: QR URL construction uses encodeURIComponent for safety.
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Smartphone,
  Camera,
  User,
  Key,
  IdCard,
  AlertTriangle,
  Download,
  Minimize2,
  LogOut,
} from 'lucide-react';
import ModalWrapper from '../../common/ModalWrapper';
import { FRONTEND_URL } from '../../../../config/api';

const accentBoxMap = {
  modern: 'bg-blue-600',
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  green: 'bg-green-600',
  dark: 'bg-slate-600',
};

const accentBorderMap = {
  modern: 'border-blue-500 bg-blue-50/30',
  blue: 'border-blue-500 bg-blue-50/30',
  purple: 'border-purple-500 bg-purple-50/30',
  green: 'border-green-500 bg-green-50/30',
  dark: 'border-slate-500 bg-slate-700/60',
};

const accentTextMap = {
  modern: 'text-blue-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  green: 'text-green-600',
  dark: 'text-slate-200',
};

const subtleIconMap = {
  modern: 'text-blue-500',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  green: 'text-green-500',
  dark: 'text-slate-300',
};

const VerificationSuccessModal = ({
  isOpen,
  onClose,
  onMinimize,
  data,
  t,
  currentTheme = 'modern',
}) => {
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);

  if (!data) return null;

  const accentBoxClass = accentBoxMap[currentTheme] || accentBoxMap.modern;
  const accentBorderClass = accentBorderMap[currentTheme] || accentBorderMap.modern;
  const accentTextClass = accentTextMap[currentTheme] || accentTextMap.modern;
  const subtleIconClass = subtleIconMap[currentTheme] || subtleIconMap.modern;

  const hasValidQR = data.id && data.id !== 'N/A';
  const qrUrl = hasValidQR
    ? `${FRONTEND_URL}/verify/${encodeURIComponent(data.id)}`
    : `${FRONTEND_URL}/verify/pending`;

  const downloadQR = () => {
    const svg = document.getElementById('resident-qr');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const qrSize = 800;
      const margin = (1000 - qrSize) / 2;
      ctx.drawImage(img, margin, margin, qrSize, qrSize);

      const link = document.createElement('a');
      link.download = `QR-${data.id}-${data.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(
      unescape(encodeURIComponent(svgData)),
    )}`;
  };

  const handleFullClose = () => {
    setShowLeavePrompt(true);
  };

  const handleCancelLeave = () => {
    setShowLeavePrompt(false);
  };

  const handleConfirmLeave = () => {
    setShowLeavePrompt(false);
    onClose();
  };

  const handleMinimize = () => {
    setShowLeavePrompt(false);
    onMinimize?.();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleMinimize}
      t={t}
      title={
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2 shadow-lg ${accentBoxClass}`}>
            <ShieldCheck className="text-white" size={20} />
          </div>
          <h2 className={`text-sm font-black uppercase tracking-widest ${t?.cardText} ${accentTextClass}`}>
            Registration Successful
          </h2>
        </div>
      }
    >
      <div className="mb-4 -mt-2 flex justify-end gap-2">
        <button
          onClick={handleMinimize}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Minimize and keep the credentials available"
          type="button"
        >
          <Minimize2 size={12} /> Minimize
        </button>
        <button
          onClick={handleFullClose}
          className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/30"
          title="Close this credentials screen"
          type="button"
        >
          <LogOut size={12} /> Done
        </button>
      </div>

      <div>
        <div className="flex flex-col items-stretch gap-8 p-2 md:flex-row">
          <div
            className={`w-full md:w-2/5 flex flex-col items-center justify-center rounded-[2.5rem] border-2 ${t?.cardBorder} ${t?.inlineBg} p-6 shadow-inner`}
          >
            <div className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-2xl">
              {hasValidQR ? (
                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block cursor-pointer transition-opacity hover:opacity-80"
                  title="Click to preview verification page"
                >
                  <QRCodeSVG
                    id="resident-qr"
                    value={qrUrl}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </a>
              ) : (
                <div className="flex h-[200px] w-[200px] flex-col items-center justify-center rounded-xl bg-slate-100">
                  <p className="px-4 text-center text-[10px] font-black uppercase text-slate-400">
                    QR unavailable, token not yet generated
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={downloadQR}
              disabled={!hasValidQR}
              className="mb-4 flex w-full justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
            >
              <Download size={14} /> Download QR File
            </button>

            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                Official Resident ID
              </p>
              <p className="mt-1 font-mono text-[9px] font-bold text-slate-400">
                SCAN TO VERIFY IDENTITY
              </p>
            </div>
          </div>

          <div className="w-full space-y-3 md:w-3/5">
            <CredentialBox
              label="FULL LEGAL NAME"
              value={data.name}
              icon={User}
              t={t}
              currentTheme={currentTheme}
            />
            <CredentialBox
              label="UNIQUE BARANGAY ID"
              value={data.id}
              icon={IdCard}
              highlight
              t={t}
              currentTheme={currentTheme}
            />
            <CredentialBox
              label="LOGIN USERNAME"
              value={data.user}
              icon={Smartphone}
              t={t}
              currentTheme={currentTheme}
            />
            <CredentialBox
              label="TEMPORARY PASSWORD"
              value={data.pass}
              icon={Key}
              isSecret
              t={t}
              currentTheme={currentTheme}
            />

            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={16} />
                <p className="text-[10px] font-bold uppercase leading-snug text-amber-900">
                  Reminder: Resident must change this password immediately after first login.
                </p>
              </div>
              <div className={`flex items-center gap-3 rounded-2xl p-4 shadow-xl ${accentBoxClass}`}>
                <Camera className="shrink-0 text-white" size={18} />
                <p className="text-[10px] font-black uppercase text-white">
                  Staff: Ensure resident has copied or photographed this screen before closing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {showLeavePrompt && (
          <div
            className="fixed inset-0 z-[10020] flex items-center justify-center bg-slate-900/30 p-4"
            onClick={handleCancelLeave}
          >
            <div
              className={`w-full max-w-sm rounded-2xl border ${t?.cardBorder} ${t?.cardBg} shadow-2xl`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-slate-700/70">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentBoxClass}`}
                >
                  <AlertTriangle className="text-white" size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-spartan text-lg font-bold ${t?.cardText}`}>
                    Close this screen?
                  </h3>
                  <p className={`mt-1 font-kumbh text-sm leading-6 ${t?.subtleText}`}>
                    Make sure the resident has saved the username and temporary password before leaving.
                  </p>
                </div>
              </div>

              <div className="space-y-4 px-5 py-4">
                <div className={`rounded-xl border ${t?.cardBorder} ${t?.inlineBg} p-3`}>
                  <div className="flex items-start gap-2.5">
                    <Camera className={subtleIconClass} size={16} />
                    <p className={`font-kumbh text-sm leading-6 ${t?.subtleText}`}>
                      Confirm that the QR, username, and password details have been copied.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancelLeave}
                    className={`rounded-lg border ${t?.cardBorder} ${t?.inlineBg} px-4 py-2.5 text-sm font-semibold ${t?.cardText} transition-colors hover:bg-slate-50 dark:hover:bg-slate-800`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLeave}
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

const CredentialBox = ({
  label,
  value,
  icon: Icon,
  highlight,
  isSecret,
  t,
  currentTheme = 'modern',
}) => {
  const accentBorderClass = accentBorderMap[currentTheme] || accentBorderMap.modern;
  const accentTextClass = accentTextMap[currentTheme] || accentTextMap.modern;
  const subtleIconClass = subtleIconMap[currentTheme] || subtleIconMap.modern;

  return (
    <div
      className={`rounded-xl border p-3 shadow-sm ${highlight ? accentBorderClass : `${t?.cardBorder} ${t?.cardBg}`}`}
    >
      <div className="mb-1 flex items-center gap-2">
        {Icon && <Icon size={12} className={highlight ? accentTextClass : subtleIconClass} />}
        <span className={`text-[9px] font-black uppercase tracking-widest ${t?.subtleText}`}>
          {label}
        </span>
      </div>
      <p
        className={`text-sm font-mono font-bold ${highlight ? accentTextClass : t?.cardText} ${
          isSecret
            ? 'rounded border border-amber-200 bg-amber-100 px-2 py-0.5 text-amber-700'
            : ''
        }`}
      >
        {value || '---'}
      </p>
    </div>
  );
};

export default VerificationSuccessModal;

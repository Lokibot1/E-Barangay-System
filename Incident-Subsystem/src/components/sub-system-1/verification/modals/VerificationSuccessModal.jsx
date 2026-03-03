import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Smartphone, Camera, User, Key, IdCard, AlertTriangle, Download } from 'lucide-react';
import ModalWrapper from '../../common/ModalWrapper';
import { VERIFY_URL } from '../../../../config/api';

const VerificationSuccessModal = ({ isOpen, onClose, data, t }) => {
    if (!data) return null;

    // Construct the external verification URL
    const qrUrl = `${VERIFY_URL}/verify/${data.user}/${data.token}`;

    const downloadQR = () => {
        const svg = document.getElementById("resident-qr");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = 1000;
            canvas.height = 1000;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const qrSize = 800;
            const margin = (1000 - qrSize) / 2;
            ctx.drawImage(img, margin, margin, qrSize, qrSize);

            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `QR-${data.id}-${data.name}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const handleClose = () => {
        if (window.confirm("Have you saved the credentials? This temporary password will be hidden once you close this window.")) {
            onClose();
        }
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={handleClose}
            t={t}
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-xl shadow-lg">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                    <h2 className={`text-sm font-black uppercase tracking-widest ${t.cardText} text-emerald-600`}>Verification Success</h2>
                </div>
            }
        >
            <div className="flex flex-col md:flex-row gap-8 items-stretch p-2">

                {/* LEFT: QR CODE SECTION */}
                <div className={`w-full md:w-2/5 flex flex-col items-center justify-center p-6 ${t.inlineBg} rounded-[2.5rem] border-2 ${t.cardBorder} shadow-inner`}>
                    <div className="bg-white p-4 rounded-3xl shadow-2xl mb-4 border border-slate-100">
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
                    </div>

                    <button
                        onClick={downloadQR}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg mb-4 w-full justify-center"
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
                    <CredentialBox label="FULL LEGAL NAME" value={data.name} icon={User} t={t} />
                    <CredentialBox label="UNIQUE BARANGAY ID" value={data.id} icon={IdCard} highlight t={t} />
                    <CredentialBox label="LOGIN USERNAME" value={data.user} icon={Smartphone} t={t} />
                    <CredentialBox label="TEMPORARY PASSWORD" value={data.pass} icon={Key} isSecret t={t} />

                    <div className="mt-6 space-y-2">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                            <AlertTriangle className="text-amber-600 shrink-0" size={16} />
                            <p className="text-[10px] font-bold text-amber-900 leading-snug uppercase">
                                REMINDER: Change password immediately after first login.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-600 rounded-2xl shadow-xl">
                            <Camera className="text-white shrink-0" size={18} />
                            <p className="text-[10px] font-black text-white uppercase">
                                Staff: Ensure resident has copied or photographed this screen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

const CredentialBox = ({ label, value, icon: Icon, highlight, isSecret, t }) => (
    <div className={`p-3 rounded-xl border ${highlight ? 'border-emerald-500 bg-emerald-50/30' : `${t.cardBorder} ${t.cardBg}`} shadow-sm`}>
        <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={12} className={highlight ? "text-emerald-500" : "text-slate-400"} />}
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <p className={`text-sm font-mono font-bold ${highlight ? 'text-emerald-600' : t.cardText} ${isSecret ? 'bg-amber-100 px-2 py-0.5 rounded text-amber-700 border border-amber-200' : ''}`}>
            {value || '---'}
        </p>
    </div>
);

export default VerificationSuccessModal;

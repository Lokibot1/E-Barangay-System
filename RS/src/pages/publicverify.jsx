import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL, FRONTEND_URL, STORAGE_URL } from '../config/api';

// Asset Imports
import bgyLogo from '../assets/bgylogo.png';
import atl from '../assets/atl.png';

const PublicVerify = () => {
    const { id } = useParams(); 
    const [resident, setResident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVerification = async () => {
            try {
                const normalizedId = (String(id || '').toUpperCase().match(/BGN-\d+/) || [String(id || '').toUpperCase()])[0];
                const response = await axios.get(`${API_BASE_URL}/barangay-id/${encodeURIComponent(normalizedId)}`);
                setResident(response.data); 
            } catch (err) {
                console.error("API Error:", err);
                if (!err.response) {
                    setError("Cannot connect to verification server");
                } else {
                    setError(err.response?.data?.message || "Invalid Barangay ID");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchVerification();
    }, [id]);

    const resolveStorageMediaUrl = (rawUrl) => {
        if (!rawUrl) return null;
        const baseStorage = String(STORAGE_URL || '').replace(/\/+$/, '');

        if (rawUrl.startsWith('/storage/')) {
            return `${baseStorage}/${rawUrl.replace(/^\/storage\//, '')}`;
        }

        try {
            const parsed = new URL(rawUrl, window.location.origin);
            const marker = '/storage/';
            const idx = parsed.pathname.indexOf(marker);
            if (idx !== -1) {
                const relative = parsed.pathname.slice(idx + marker.length).replace(/^\/+/, '');
                return `${baseStorage}/${relative}`;
            }
        } catch {
            return rawUrl;
        }

        return rawUrl;
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 font-sans tracking-widest uppercase">
            <Loader2 className="animate-spin text-green-800 mb-4" size={40} />
            <p className="text-slate-500 text-[10px] font-bold">Verifying ID...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 font-sans p-4">
            <p className="text-red-500 font-bold uppercase">{error}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-200 flex flex-col items-center py-10 px-4 font-serif">
            
            <h2 className="mb-8 text-slate-500 font-sans font-bold text-xs uppercase tracking-[0.3em]">Official Barangay Records</h2>

            {/* FLEX CONTAINER: Side by Side on Desktop, Stacked on Mobile */}
            <div className="flex flex-wrap justify-center gap-10 w-full max-w-6xl">
                
                {/* --- FRONT SIDE --- */}
                <div className="w-[340px] h-[520px]">
                    <div className="h-full bg-white shadow-2xl border border-gray-400 p-6 flex flex-col relative overflow-hidden rounded-lg uppercase text-slate-900">
                        {/* Watermark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.08] grayscale pointer-events-none">
                            <img src={atl} alt="watermark" className="w-full h-full object-contain" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="text-center leading-tight">
                                <p className="text-[13px] font-bold tracking-tight text-green-800">BARANGAY GULOD</p>
                                <p className="text-[11px] font-bold tracking-tighter leading-none text-slate-600">DISTRICT V, QUEZON CITY</p>
                                <h1 className="text-lg font-black mt-1">BARANGAY ID</h1>
                                
                                <div className="flex justify-center items-end gap-2 mt-2">
                                    <p className="text-[10px] font-bold leading-none">PCT. No.</p>
                                    <div className="w-24 border-b border-black h-[1px] mb-[2px]"></div>
                                </div>
                            </div>

                            <div className="flex mt-6 justify-between items-start">
                                <img src={bgyLogo} className="w-20" alt="Barangay Seal" />
                                <div className="w-[110px] h-[110px] border-2 border-black bg-white shadow-sm overflow-hidden">
                                    <img
                                        src={resolveStorageMediaUrl(resident?.photo)}
                                        className="w-full h-full object-cover"
                                        alt="Resident"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <p className="text-sm font-black border-b border-black inline-block text-center min-h-[20px]">{resident?.date_issued}</p>
                                    <p className="text-[9px] font-bold italic normal-case text-center">Date of Issue</p>
                                </div>
                                <div className="flex flex-col text-right">
                                    <p className="text-xl font-black text-red-600 leading-none">{resident?.barangay_id}</p>
                                    <p className="text-[9px] font-bold italic normal-case border-t border-black inline-block">Brgy. ID No.</p>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col items-center">
                                <p className="text-[16px] font-black tracking-wider text-center border-b-2 border-slate-800 w-full pb-1 min-h-[30px]">
                                    {resident?.full_name}
                                </p>
                                <p className="text-[9px] font-bold italic normal-case mt-1 text-slate-500 uppercase">Name</p>
                            </div>

                            <div className="mt-4 flex flex-col items-center">
                                <p className="text-[13px] font-bold text-center border-b border-slate-800 w-full pb-1 min-h-[40px] flex items-center justify-center leading-tight">
                                    {resident?.address}
                                </p>
                                <p className="text-[9px] font-bold italic normal-case mt-1 text-slate-500">Residential Address</p>
                            </div>

                            <div className="text-center mt-7 pb-4">
                                <p className="font-bold text-[13px] border-t border-black pt-1 px-2 tracking-tighter inline-block">
                                    REY ALDRIN S. TOLENTINO
                                </p>
                                <p className="text-[10px] font-bold normal-case">Barangay Captain</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BACK SIDE --- */}
                <div className="w-[340px] h-[520px]">
                    <div className="h-full bg-white shadow-2xl border border-gray-400 p-6 flex flex-col rounded-lg uppercase relative overflow-hidden text-slate-900">
                        {/* Watermark for Back */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.08] pointer-events-none">
                            <img src={atl} alt="watermark" className="w-full h-full object-contain" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <p className="text-[12px] font-black tracking-tighter border-b border-black inline-block w-fit">
                                VALID UNTIL DEC. 31, {resident?.valid_until}
                            </p>
                            <p className="text-[11px] font-black mt-2 italic text-red-700">NOTIFY IN CASE OF EMERGENCY</p>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold normal-case italic text-slate-500">Name:</p>
                                    <div className="border-b border-black w-full h-6"></div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold normal-case italic text-slate-500">Address:</p>
                                    <div className="border-b border-black w-full h-8"></div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold normal-case italic text-slate-500">Tel. No.:</p>
                                    <div className="border-b border-black w-full h-6"></div>
                                </div>
                            </div>

                            <div className="flex justify-center my-6">
                                <div className="p-2 bg-white border border-slate-200 shadow-sm">
                                    <QRCodeSVG value={`${FRONTEND_URL}/verify/${encodeURIComponent(String(id || '').trim())}`} size={80} />
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col items-center">
                                <div className="w-full flex justify-between items-end gap-2">
                                    <div className="flex-1 text-center">
                                        <div className="h-14 flex items-end justify-center mb-1">
                                            <div className="w-full border-b-2 border-black mx-4"></div>
                                        </div>
                                        <p className="text-[9px] font-bold tracking-tighter pt-1 uppercase">Signature of Holder</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-20 border border-black bg-white rounded-sm"></div>
                                        <p className="text-[8px] font-bold mt-1">RT. THUMBMARK</p>
                                    </div>
                                </div>
                                <p className="italic font-bold text-green-900 mt-6 text-xl tracking-[0.2em]">"Asenso Tayo"</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <p className="mt-12 text-slate-400 text-[8px] font-sans tracking-[0.4em] uppercase">Gulod Digital ID System</p>
        </div>
    );
};

export default PublicVerify;

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search, Mail, Phone, MousePointer2, ShieldAlert } from 'lucide-react';

export default function Support() {
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      q: "How do I verify a new resident submission?",
      a: "Navigate to the 'ID Verification' tab, select a resident with 'Pending' status, review their uploaded ID document, and click 'Approve' if all details match."
    },
    {
      q: "Where can I generate Sectoral Reports?",
      a: "In the 'Residents' registry, use the filter options to select specific groups (e.g., Seniors or PWD). The system will automatically update the view for export."
    },
    {
      q: "What should I do if the ID photo is unclear?",
      a: "Click 'Reject Submission' and select 'Blurry Image' as the reason. The resident will receive a notification to re-upload a clearer copy."
    },
    {
      q: "How are heat map intensities calculated?",
      a: "Intensities are based on live population density per Purok. Red indicates areas requiring immediate attention or high resource allocation."
    }
  ];

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Support & Resources</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[3px]">Barangay Management Technical Guide</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-8 shadow-sm rounded-[2rem]">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-xl text-emerald-600"><HelpCircle size={20}/></div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              {faqs.filter(f => f.q.toLowerCase().includes(searchTerm.toLowerCase())).map((faq, i) => (
                <details key={i} className="group border-b border-slate-50 dark:border-slate-800 pb-4 cursor-pointer">
                  <summary className="flex justify-between items-center list-none font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                    {faq.q}
                    <ChevronDown size={14} className="group-open:rotate-180 transition-transform text-slate-400" />
                  </summary>
                  <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/10">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <MousePointer2 size={18} className="text-emerald-200" />
                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[3px]">System Tips</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                        <p className="text-[9px] font-black text-emerald-200 uppercase mb-1">Navigation</p>
                        <p className="text-xs font-bold italic">Use the Sidebar to quickly toggle between Analytics and Records.</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                        <p className="text-[9px] font-black text-emerald-200 uppercase mb-1">Quick Search</p>
                        <p className="text-xs font-bold italic">Search by Name or Purok in the Registry for instant results.</p>
                    </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-900/30 p-6 rounded-[2rem]">
            <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="text-red-500" size={18} />
                <h3 className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Emergency Contacts</h3>
            </div>
            <div className="space-y-3">
               <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-red-200 dark:border-red-900/20 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">Police Station</span>
                  <span className="text-[11px] font-bold text-red-600 tracking-tighter">911</span>
               </div>
               <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-red-200 dark:border-red-900/20 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">Bureau of Fire</span>
                  <span className="text-[11px] font-bold text-red-600 tracking-tighter">117</span>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Technical Support</h3>
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                  <Mail className="text-slate-400 group-hover:text-emerald-600" size={18} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Email</p>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">support@brgysystem.ph</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
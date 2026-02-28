import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, Mail, MousePointer2, ShieldAlert } from 'lucide-react';
import themeTokens from '../../Themetokens';

export default function Support() {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'blue'
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];

  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      q: 'How do I verify a new resident submission?',
      a: "Navigate to the 'ID Verification' tab, select a resident with 'Pending' status, review their uploaded ID document, and click 'Approve' if all details match.",
    },
    {
      q: 'Where can I generate Sectoral Reports?',
      a: "In the 'Residents' registry, use the filter options to select specific groups (e.g., Seniors or PWD). The system will automatically update the view for export.",
    },
    {
      q: 'What should I do if the ID photo is unclear?',
      a: "Click 'Reject Submission' and select 'Blurry Image' as the reason. The resident will receive a notification to re-upload a clearer copy.",
    },
    {
      q: 'How are heat map intensities calculated?',
      a: 'Intensities are based on live population density per Purok. Red indicates areas requiring immediate attention or high resource allocation.',
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 pb-10">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>
          Support &amp; Resources
        </h1>
        <p className={`text-[10px] font-kumbh ${t.subtleText} uppercase tracking-[3px] mt-1`}>
          Barangay Management Technical Guide
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: FAQ + Tips */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ Card */}
          <div className={`${t.cardBg} border ${t.cardBorder} p-8 shadow-sm rounded-2xl`}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`${t.primaryLight} p-2 rounded-xl ${t.primaryText}`}>
                <HelpCircle size={20} />
              </div>
              <h2 className={`text-sm font-spartan font-bold ${t.cardText} uppercase tracking-widest`}>
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs
                .filter(f => f.q.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((faq, i) => (
                  <details
                    key={i}
                    className={`group border-b ${t.cardBorder} pb-4 cursor-pointer`}
                  >
                    <summary className={`flex justify-between items-center list-none font-kumbh font-bold ${t.cardText} text-xs uppercase tracking-tight group-hover:${t.primaryText} transition-colors`}>
                      {faq.q}
                      <ChevronDown
                        size={14}
                        className={`group-open:rotate-180 transition-transform ${t.subtleText}`}
                      />
                    </summary>
                    <p className={`mt-3 text-[11px] font-kumbh ${t.subtleText} leading-relaxed`}>
                      {faq.a}
                    </p>
                  </details>
                ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/10">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <MousePointer2 size={18} className="text-emerald-200" />
                <p className="text-emerald-100 text-[10px] font-spartan font-bold uppercase tracking-[3px]">
                  System Tips
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                  <p className="text-[9px] font-spartan font-bold text-emerald-200 uppercase mb-1">
                    Navigation
                  </p>
                  <p className="text-xs font-kumbh font-bold italic">
                    Use the Sidebar to quickly toggle between Analytics and Records.
                  </p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                  <p className="text-[9px] font-spartan font-bold text-emerald-200 uppercase mb-1">
                    Quick Search
                  </p>
                  <p className="text-xs font-kumbh font-bold italic">
                    Search by Name or Purok in the Registry for instant results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Emergency + Technical Support */}
        <div className="space-y-6">
          {/* Emergency contacts */}
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="text-red-500" size={18} />
              <h3 className="text-[10px] font-spartan font-bold text-red-700 uppercase tracking-widest">
                Emergency Contacts
              </h3>
            </div>
            <div className="space-y-3">
              <div className={`${t.cardBg} p-3 rounded-xl border border-red-200 flex justify-between items-center`}>
                <span className={`text-[10px] font-spartan font-bold ${t.cardText} uppercase`}>
                  Police Station
                </span>
                <span className="text-[11px] font-kumbh font-bold text-red-600 tracking-tighter">
                  911
                </span>
              </div>
              <div className={`${t.cardBg} p-3 rounded-xl border border-red-200 flex justify-between items-center`}>
                <span className={`text-[10px] font-spartan font-bold ${t.cardText} uppercase`}>
                  Bureau of Fire
                </span>
                <span className="text-[11px] font-kumbh font-bold text-red-600 tracking-tighter">
                  117
                </span>
              </div>
            </div>
          </div>

          {/* Technical support */}
          <div className={`${t.cardBg} border ${t.cardBorder} p-6 rounded-2xl shadow-sm`}>
            <h3 className={`text-[10px] font-spartan font-bold ${t.subtleText} uppercase tracking-widest mb-6`}>
              Technical Support
            </h3>
            <div className="space-y-4">
              <div className={`flex items-center gap-4 p-4 ${t.inlineBg} rounded-xl group hover:${t.primaryLight} transition-colors`}>
                <Mail className={`${t.subtleText} group-hover:${t.primaryText}`} size={18} />
                <div>
                  <p className={`text-[9px] font-spartan font-bold ${t.subtleText} uppercase`}>Email</p>
                  <p className={`text-[11px] font-kumbh font-bold ${t.cardText}`}>
                    support@brgysystem.ph
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

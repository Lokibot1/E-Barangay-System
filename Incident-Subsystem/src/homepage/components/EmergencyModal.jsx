import { AlertTriangle } from "lucide-react";

export default function EmergencyModal({ isOpen, isDarkMode, hotlines, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-red-950/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`w-full max-w-md rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${
          isDarkMode
            ? "bg-slate-900 border border-white/10"
            : "bg-white border border-black/5"
        }`}
      >
        <div className="bg-red-600 p-6 md:p-8 text-white text-center">
          <AlertTriangle size={40} className="mx-auto mb-4 animate-bounce" />
          <h4 className="text-xl md:text-2xl font-black uppercase italic">
            Emergency Hotlines
          </h4>
        </div>
        <div className="p-6 md:p-8 space-y-4">
          {hotlines.map((item) => (
            <a
              key={item.id}
              href={`tel:${item.phone}`}
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                isDarkMode ? "bg-white/5" : "bg-red-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="text-red-600" size={18} />
                <span className="text-[10px] font-black uppercase tracking-tight">
                  {item.label}
                </span>
              </div>
              <span className="text-[10px] font-bold text-red-600">{item.phone}</span>
            </a>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-4 text-[9px] font-black uppercase tracking-widest opacity-50 hover:opacity-100"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}

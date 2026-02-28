import { Calendar, Facebook, Send, X } from "lucide-react";

export default function NewsModal({
  selectedNews,
  isDarkMode,
  fallbackImage,
  onClose,
}) {
  if (!selectedNews) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`w-full max-w-2xl rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${
          isDarkMode ? "bg-slate-900 border border-white/10" : "bg-white"
        }`}
      >
        <div className="relative h-56 md:h-80 w-full overflow-hidden">
          <img
            src={selectedNews.image}
            alt={selectedNews.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <button
            type="button"
            aria-label="Close article"
            onClick={onClose}
            className="absolute top-4 right-4 p-3 rounded-full bg-black/40 text-white hover:bg-red-600 transition-all backdrop-blur-md z-10"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            <span
              className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block shadow-lg ${
                selectedNews.urgent
                  ? "bg-red-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {selectedNews.tag}
            </span>
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white leading-none italic drop-shadow-lg">
              {selectedNews.title}
            </h3>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-[10px] font-bold opacity-40 uppercase tracking-widest">
              <Calendar size={12} className="text-emerald-600" /> {selectedNews.date}
            </div>
            <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">
              Share this update:
            </span>
          </div>

          <div
            className={`text-sm md:text-base leading-relaxed mb-8 max-h-[180px] overflow-y-auto pr-4 custom-scrollbar ${
              isDarkMode ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {selectedNews.fullContent}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-[2] py-4 bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-800 transition-all shadow-lg active:scale-95"
            >
              Close Article
            </button>

            <div className="flex flex-1 gap-2">
              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  )
                }
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] ${
                  isDarkMode
                    ? "border-white/10 text-white bg-white/5"
                    : "border-black/5 text-slate-900 bg-slate-50"
                }`}
                title="Share on Facebook"
              >
                <Facebook size={16} />
                <span className="text-[9px] font-black uppercase">FB</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${selectedNews.title} - ${window.location.href}`,
                  );
                  alert("Link copied to clipboard!");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600 ${
                  isDarkMode
                    ? "border-white/10 text-white bg-white/5"
                    : "border-black/5 text-slate-900 bg-slate-50"
                }`}
                title="Copy Link"
              >
                <Send size={16} />
                <span className="text-[9px] font-black uppercase">Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

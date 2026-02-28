export default function ServiceCard({ service, isDarkMode }) {
  return (
    <div className="group">
      <div
        className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        } ${service.color}`}
      >
        <service.icon size={28} className="md:size-[32px]" />
      </div>
      <h4 className="text-lg md:text-xl font-black uppercase mb-3">{service.title}</h4>
      <p className="text-xs md:text-sm opacity-60 max-w-xs mx-auto">{service.desc}</p>
    </div>
  );
}

const steps = [
  { title: "Register & Verify", icon: "👤" },
  { title: "Select Services", icon: "📋" },
  { title: "Submit Requirements Online", icon: "📤" },
  { title: "Track & Receive Document", icon: "📄" },
];

export default function User_Process() {
  return (
    <section className="py-16 bg-white text-center">
      <h3 className="text-2xl font-bold mb-12">Simple 4-Step Process</h3>
      <div className="relative flex flex-row flex-wrap items-center justify-between max-w-5xl mx-auto px-4">
        {/* Connector line (stretches and stays centered) */}
        <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-gray-200 z-0 transform -translate-y-1/2"></div>

        {steps.map((step, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center flex-1 min-w-[120px] max-w-[260px] px-4 py-6">
            <div className="w-20 md:w-28 lg:w-32 h-20 md:h-28 lg:h-32 bg-gradient-to-b from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-2xl md:text-4xl mb-4 border-4 border-white shadow-lg">
              {step.icon}
            </div>
            <p className="font-bold text-sm md:text-base text-gray-800 leading-tight mt-2 text-center">{step.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

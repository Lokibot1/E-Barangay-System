const steps = [
  "Register & Verify",
  "Select Services",
  "Submit Requirements",
  "Track & Receive Document",
]

export default function User_Steps() {
  return (
    <section className="py-16">
      <h2 className="text-center font-semibold mb-10">
        Simple 4-Step Process
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
        {steps.map((step, i) => (
          <div key={i} className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-700 text-white flex items-center justify-center font-bold mb-3">
              {i + 1}
            </div>
            <p className="text-sm font-medium">{step}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

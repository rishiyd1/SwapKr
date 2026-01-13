import React from "react";

const Working = () => {
  const steps = [
    {
      id: 1,
      title: "Sign Up & Verify",
      description:
        "Create your account using your university email. We verify you're a real student at your campus.",
      image:
        "https://img.freepik.com/free-vector/user-verification-unauthorized-access-prevention-private-account-authentication-cyber-security-shield-padlock-protection-system-design-element_335657-1545.jpg",
      cardBg: "bg-[#E6E1FF]",
    },
    {
      id: 2,
      title: "Browse or List",
      description:
        "Find what you need or list items you want to sell or lend. Everything stays within your campus.",
      image:
        "https://img.freepik.com/free-vector/order-confirmed-concept-illustration_114360-1486.jpg",
      cardBg: "bg-white",
    },
    {
      id: 3,
      title: "Meet & Exchange",
      description:
        "Connect with other students and arrange safe meetups on campus to complete your transaction.",
      image:
        "https://img.freepik.com/free-vector/shaking-hands-concept-illustration_114360-5534.jpg",
      cardBg: "bg-[#D8EEFF]",
    },
  ];

  return (
    <section className="w-full bg-[#f1efeecd] pt-8 pb-24 font-['Outfit']">
      {/* z-index fix stays */}
      <div className="relative z-10 max-w-6xl mx-auto px-12">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
  <span className="text-[#0D1B2A]">How </span>
  <span className="text-[#0D1B2A]">CAMPUS </span>
  <span className="text-[#f57404]">Xchange </span>
  <span className="text-[#0D1B2A]">Works</span>
</h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Getting started with Campus Xchange is simple and secure
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 justify-items-center">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              
              <div
                className={`${step.cardBg} w-[260px] h-[260px] rounded-[2.5rem] flex items-center justify-center mb-8`}
              >
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-[85%] h-[85%] object-contain mix-blend-multiply"
                />
              </div>

              <div className="bg-[#6366F1] text-white w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold mb-4">
                {step.id}
              </div>

              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 text-center">
                {step.title}
              </h3>
              <p className="text-[#666] text-center text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Working;

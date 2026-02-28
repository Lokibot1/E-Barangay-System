import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";

import bsbPic from "../assets/images/bgygulod.png";
import logoPic from "../assets/images/bgylogo.png";
import officialFallback from "../assets/images/atl.png";
import AnnouncementsSection from "./components/AnnouncementsSection";
import ContactSection from "./components/ContactSection";
import EventsCalendarSection from "./components/EventsCalendarSection";
import FAQSection from "./components/FAQSection";
import FloatingWidgets from "./components/FloatingWidgets";
import HeroSection from "./components/HeroSection";
import HomeFooter from "./components/HomeFooter";
import NewsModal from "./components/NewsModal";
import OfficialsSection from "./components/OfficialsSection";
import ServiceCard from "./components/ServiceCard";
import {
  announcements,
  createMessageId,
  defaultChatMessage,
  faqItems,
  officials,
  upcomingEvents,
  services,
  socialLinks,
} from "./data/homepageData";

const WEATHER_API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=14.676&longitude=121.0437&current=temperature_2m,weather_code&timezone=Asia%2FManila";
const WEATHER_REFRESH_MS = 10 * 60 * 1000;

const WEATHER_CODE_LABELS = {
  0: "Clear",
  1: "Mostly Clear",
  2: "Partly Cloudy",
  3: "Cloudy",
  45: "Foggy",
  48: "Foggy",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  56: "Freezing Drizzle",
  57: "Freezing Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  66: "Freezing Rain",
  67: "Freezing Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Rain Showers",
  81: "Rain Showers",
  82: "Heavy Showers",
  85: "Snow Showers",
  86: "Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

const getWeatherLabel = (code) => WEATHER_CODE_LABELS[code] ?? "Fair";

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("homepage-theme") === "dark";
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [weather, setWeather] = useState({
    temp: "-- C",
    condition: "Loading...",
  });
  const [chatHistory, setChatHistory] = useState([defaultChatMessage]);
  const [contactData, setContactData] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState("idle");

  const scrollProgressRef = useRef(null);
  const scrollRafRef = useRef(null);
  const scrolledRef = useRef(false);
  const backToTopRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.localStorage.setItem("homepage-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchWeather = async () => {
      try {
        const response = await fetch(WEATHER_API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Weather request failed with ${response.status}`);
        }

        const data = await response.json();
        const current = data?.current;
        if (!current || typeof current.temperature_2m !== "number") {
          throw new Error("Weather payload is missing current values");
        }

        setWeather({
          temp: `${Math.round(current.temperature_2m)} C`,
          condition: getWeatherLabel(current.weather_code),
        });
      } catch (error) {
        if (error?.name === "AbortError") return;
        setWeather((prev) =>
          prev.condition === "Loading..."
            ? { temp: "-- C", condition: "Unavailable" }
            : prev
        );
      }
    };

    fetchWeather();
    const weatherTimer = window.setInterval(fetchWeather, WEATHER_REFRESH_MS);

    return () => {
      controller.abort();
      window.clearInterval(weatherTimer);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const nextIsScrolled = window.scrollY > 50;
      if (nextIsScrolled !== scrolledRef.current) {
        scrolledRef.current = nextIsScrolled;
        setIsScrolled(nextIsScrolled);
      }

      const nextShowBackToTop = window.scrollY > 500;
      if (nextShowBackToTop !== backToTopRef.current) {
        backToTopRef.current = nextShowBackToTop;
        setShowBackToTop(nextShowBackToTop);
      }

      if (scrollRafRef.current) return;

      scrollRafRef.current = window.requestAnimationFrame(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        if (scrollProgressRef.current) {
          scrollProgressRef.current.style.width = `${progress}%`;
        }
        scrollRafRef.current = null;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isChatOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isChatOpen]);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
  };

  const handleContactChange = (field, value) => {
    setContactData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => {
      setFormStatus("success");
      setContactData({ name: "", email: "", message: "" });
      setTimeout(() => setFormStatus("idle"), 3000);
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const userText = chatMessage.trim();
    if (!userText) return;

    setChatHistory((prev) => [
      ...prev,
      { id: createMessageId(), role: "user", text: userText },
    ]);
    setChatMessage("");

    setTimeout(() => {
      let botResponse =
        "I'm sorry, I didn't quite get that. You can ask about 'ID', 'Clearance', or 'Location'.";
      const msg = userText.toLowerCase();
      if (msg.includes("id")) {
        botResponse =
          "To get a Resident ID, please Register/Login and go to Step 4 to upload your requirements.";
      }
      if (msg.includes("clearance") || msg.includes("indigency")) {
        botResponse =
          "You can apply for E-Certifications under the Services section after logging in.";
      }
      if (msg.includes("location") || msg.includes("hall")) {
        botResponse =
          "The Barangay Hall is located at Villareal St., Gulod, QC. Open Mon-Fri, 8AM-5PM.";
      }

      setChatHistory((prev) => [
        ...prev,
        { id: createMessageId(), role: "bot", text: botResponse },
      ]);
    }, 1000);
  };

  const homepageNavItems = [
    { id: "news", label: "News" },
    { id: "events", label: "Events" },
    { id: "services", label: "Services" },
    { id: "faq", label: "FAQ" },
    { id: "officials", label: "Officials" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900"
      } overflow-x-hidden`}
    >
      <div
        ref={scrollProgressRef}
        className="fixed top-0 left-0 h-1 bg-emerald-500 z-[200] transition-all duration-100"
      />

      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-300 backdrop-blur-md ${
          isScrolled
            ? isDarkMode
              ? "bg-slate-900/90 border-b border-white/10 py-3"
              : "bg-white/90 border-b border-black/5 py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <button
            type="button"
            aria-label="Go to top"
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src={logoPic}
              alt="Logo"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-emerald-500/30"
            />
            <div className="flex flex-col">
              <span className="font-black tracking-tighter text-lg md:text-xl uppercase italic leading-none">
                Barangay <span className="text-emerald-600">Gulod</span>
              </span>
              <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] opacity-60 flex items-center gap-1">
                <ShieldCheck size={8} className="text-emerald-500" /> Official Website
              </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-6">
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
                isDarkMode ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
              }`}
            >
              <Sun size={14} className="text-amber-500" />
              <div className="text-left leading-none">
                <p className="text-[7px] font-black uppercase opacity-50 mb-1">Local Weather</p>
                <p className="text-[10px] font-bold uppercase">
                  {weather.temp} - {weather.condition}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
              {homepageNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="hover:text-emerald-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 transition-transform hover:scale-110"
              >
                {isDarkMode ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} className="text-emerald-800" />
                )}
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-emerald-700 text-white px-8 py-3 rounded-2xl hover:bg-emerald-800 transition-all shadow-xl active:scale-95"
              >
                Login
              </button>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <button
              type="button"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-emerald-800" />
              )}
            </button>
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className={`lg:hidden absolute top-full left-0 w-full p-6 border-b animate-in slide-in-from-top-2 duration-300 ${
              isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-black/5 shadow-xl"
            }`}
          >
            <div className="flex flex-col gap-6 text-center font-black uppercase tracking-widest text-xs">
              {homepageNavItems.map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)}>
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => navigate("/login")}
                className="bg-emerald-700 text-white py-4 rounded-2xl shadow-lg"
              >
                Login / Register
              </button>
            </div>
          </div>
        )}
      </nav>

      <HeroSection
        isDarkMode={isDarkMode}
        backgroundImage={bsbPic}
        onGetDigitalId={() => navigate("/auth")}
        onLatestNews={() => scrollToSection("news")}
      />
      <AnnouncementsSection
        isDarkMode={isDarkMode}
        announcements={announcements}
        fallbackImage={bsbPic}
        onReadMore={setSelectedNews}
      />

      <EventsCalendarSection isDarkMode={isDarkMode} events={upcomingEvents} />

      <NewsModal
        selectedNews={selectedNews}
        isDarkMode={isDarkMode}
        fallbackImage={bsbPic}
        onClose={() => setSelectedNews(null)}
      />

      <section
        id="services"
        className={`py-16 md:py-24 px-6 scroll-mt-24 ${
          isDarkMode ? "bg-slate-900/50" : "bg-emerald-50/50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 text-center">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} isDarkMode={isDarkMode} />
            ))}
          </div>
        </div>
      </section>

      <FAQSection isDarkMode={isDarkMode} faqItems={faqItems} />

      <OfficialsSection
        officials={officials}
        isDarkMode={isDarkMode}
        fallbackImage={officialFallback}
      />

      <ContactSection
        isDarkMode={isDarkMode}
        contactData={contactData}
        formStatus={formStatus}
        onContactSubmit={handleContactSubmit}
        onContactChange={handleContactChange}
      />

      <HomeFooter
        isDarkMode={isDarkMode}
        logoSrc={logoPic}
        socialLinks={socialLinks}
        onNewsClick={() => scrollToSection("news")}
        onCitizenPortalClick={() => navigate("/auth")}
        onOfficialsClick={() => scrollToSection("officials")}
      />

      <FloatingWidgets
        isDarkMode={isDarkMode}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        onCloseChat={() => setIsChatOpen(false)}
        chatHistory={chatHistory}
        chatMessage={chatMessage}
        onChatMessageChange={setChatMessage}
        onSendMessage={handleSendMessage}
        showBackToTop={showBackToTop}
        onBackToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `,
        }}
      />
    </div>
  );
}



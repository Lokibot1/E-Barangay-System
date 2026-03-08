import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import bsbPic from "../assets/images/bgygulod.png";
import logoPic from "../assets/images/bgylogo.png";
import officialFallback from "../assets/images/atl.png";
import AnnouncementsSection from "./components/AnnouncementsSection";
import ContactSection from "./components/ContactSection";
import EventsCalendarSection from "./components/EventsCalendarSection";
import FAQSection from "./components/FAQSection";
import HeroSection from "./components/HeroSection";
import HomeFooter from "./components/HomeFooter";
import NewsModal from "./components/NewsModal";
import OfficialsSection from "./components/OfficialsSection";
import ServiceCard from "./components/ServiceCard";
import {
  announcements,
  faqItems,
  officials,
  upcomingEvents,
  services,
  socialLinks,
} from "./data/homepageData";

export default function HomePage() {
  // ── Theme — sync with the app's theme system ─────────────────────────
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue",
  );
  const isDarkMode = currentTheme === "dark";

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  // ── UI state ─────────────────────────────────────────────────────────
  const [selectedNews, setSelectedNews] = useState(null);
  const [contactData, setContactData] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState("idle");

  const navigate = useNavigate();

  // ── Scroll to section (works within Layout's scroll container) ────────
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Contact form ──────────────────────────────────────────────────────
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

  return (
    <div
      id="main-content"
      className={`font-kumbh transition-colors duration-500 overflow-x-hidden ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900"
      }`}
    >
      <HeroSection
        isDarkMode={isDarkMode}
        backgroundImage={bsbPic}
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
        onCitizenPortalClick={() => navigate("/sub-system-2")}
        onOfficialsClick={() => scrollToSection("officials")}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
      `,
        }}
      />
    </div>
  );
}

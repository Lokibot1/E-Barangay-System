import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranding } from "../context/BrandingContext";

import bsbPic from "../assets/images/bgygulod.png";
import logoPic from "../assets/images/bgylogo.png";
import officialFallback from "../assets/images/atl.png";
import AnnouncementsSection from "./components/AnnouncementsSection";
import ContactSection from "./components/ContactSection";
import EventsCalendarSection from "./components/EventsCalendarSection";
import FAQSection from "./components/FAQSection";
import FeedbackSection from "./components/FeedbackSection";
import HeroSection from "./components/HeroSection";
import HomeFooter from "./components/HomeFooter";
import HomeNavbar from "./components/HomeNavbar";
import NewsModal from "./components/NewsModal";
import OfficialsSection from "./components/OfficialsSection";
import ServiceCard from "./components/ServiceCard";
import ScrollReveal from "./components/ScrollReveal";
import {
  ANNOUNCEMENTS_UPDATED_EVENT,
  loadPublishedAnnouncements,
  revokeAnnouncementMediaUrls,
  subscribeToAnnouncementAutoPublish,
} from "../services/shared/announcementBoardService";
import {
  announcements as homepageAnnouncements,
  faqItems,
  initialFeedbackEntries,
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
  const announcementMediaUrlsRef = useRef(new Set());

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  useEffect(() => {
    let isDisposed = false;
    const mediaUrlsRegistry = announcementMediaUrlsRef.current;

    const rememberAnnouncementMediaUrls = (items) => {
      (Array.isArray(items) ? items : []).forEach((item) => {
        const url = item?.media?.url;
        if (typeof url === "string" && url.startsWith("blob:")) {
          mediaUrlsRegistry.add(url);
        }
      });
    };

    const syncAnnouncements = async () => {
      try {
        const nextAnnouncements = await loadPublishedAnnouncements(
          homepageAnnouncements,
        );

        if (isDisposed) {
          revokeAnnouncementMediaUrls(nextAnnouncements);
          return;
        }

        rememberAnnouncementMediaUrls(nextAnnouncements);
        setAnnouncementBoard(nextAnnouncements);
      } catch {
        if (!isDisposed) {
          setAnnouncementBoard(homepageAnnouncements);
        }
      }
    };
    const unsubscribeAutoPublish = subscribeToAnnouncementAutoPublish();

    void syncAnnouncements();
    window.addEventListener(ANNOUNCEMENTS_UPDATED_EVENT, syncAnnouncements);

    return () => {
      isDisposed = true;
      unsubscribeAutoPublish();
      window.removeEventListener(
        ANNOUNCEMENTS_UPDATED_EVENT,
        syncAnnouncements,
      );
      mediaUrlsRegistry.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      mediaUrlsRegistry.clear();
    };
  }, []);

  // ── UI state ─────────────────────────────────────────────────────────
  const [selectedNews, setSelectedNews] = useState(null);
  const [announcementBoard, setAnnouncementBoard] = useState(
    () => homepageAnnouncements,
  );
  const { logoDataUrl } = useBranding();
  const logoSrc = logoDataUrl || logoPic;

  const homepageEvents = useMemo(() => {
    const formatDateKey = (value) => {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formatTimeLabel = (value) => {
      if (!value) return "Time to be announced";

      if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
        const [hours = "00", minutes = "00"] = value.split(":");
        const date = new Date();
        date.setHours(Number(hours), Number(minutes), 0, 0);
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "Time to be announced";

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const announcementEvents = (announcementBoard || [])
      .filter((item) => String(item?.tag || "").toLowerCase() === "event")
      .map((item) => {
        const eventDate =
          item?.event_date || item?.publish_at || item?.created_at || "";

        return {
          id: `announcement-event-${item.id}`,
          date: formatDateKey(eventDate),
          startTime: formatTimeLabel(
            item?.event_start_time || item?.publish_at,
          ),
          endTime: item?.event_end_time
            ? formatTimeLabel(item.event_end_time)
            : "",
          title: item.title || "Barangay Event",
          category: item.tag || "Event",
          location: item?.event_location || "See announcement details",
          details:
            item.desc ||
            item.fullContent ||
            "Check the announcement card for the full event details.",
          source: "announcement",
        };
      })
      .filter((item) => item.date);

    return [...announcementEvents, ...upcomingEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [announcementBoard]);

  const navigate = useNavigate();

  // ── Scroll to section (works within Layout's scroll container) ────────
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Contact form ──────────────────────────────────────────────────────
  return (
    <div
      id="main-content"
      className={`font-kumbh transition-colors duration-500 overflow-x-hidden ${
        isDarkMode
          ? "bg-slate-950 text-white"
          : "bg-[linear-gradient(180deg,#f5faf7_0%,#eef6f1_100%)] text-slate-900"
      }`}
    >
      <HomeNavbar isDarkMode={isDarkMode} onScrollTo={scrollToSection} />

      <HeroSection
        isDarkMode={isDarkMode}
        backgroundImage={bsbPic}
        onLatestNews={() => scrollToSection("news")}
        onExploreServices={() => scrollToSection("services")}
      />

      <AnnouncementsSection
        isDarkMode={isDarkMode}
        announcements={announcementBoard}
        fallbackImage={bsbPic}
        onReadMore={setSelectedNews}
      />

      <EventsCalendarSection isDarkMode={isDarkMode} events={homepageEvents} />

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
            {services.map((service, index) => (
              <ScrollReveal
                key={service.id}
                delay={80}
                staggerIndex={index}
                className="h-full"
              >
                <ServiceCard service={service} isDarkMode={isDarkMode} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <FAQSection isDarkMode={isDarkMode} faqItems={faqItems} />

      <FeedbackSection
        isDarkMode={isDarkMode}
        initialFeedbackEntries={initialFeedbackEntries}
      />

      <OfficialsSection
        officials={officials}
        isDarkMode={isDarkMode}
        fallbackImage={officialFallback}
      />

      <ContactSection isDarkMode={isDarkMode} />

      <HomeFooter
        isDarkMode={isDarkMode}
        logoSrc={logoSrc}
        socialLinks={socialLinks}
        onAboutClick={() => scrollToSection("about")}
        onNewsClick={() => scrollToSection("news")}
        onCitizenPortalClick={() => navigate("/sub-system-2")}
        onServicesClick={() => scrollToSection("services")}
        onOfficialsClick={() => scrollToSection("officials")}
        onFeedbackClick={() => scrollToSection("feedback")}
        onContactClick={() => scrollToSection("contact")}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-up {
          opacity: 0;
          animation: fade-up 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />
    </div>
  );
}

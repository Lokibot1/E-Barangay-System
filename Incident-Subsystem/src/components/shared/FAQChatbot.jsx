import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart2,
  Bot,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  Facebook,
  FileText,
  Hand,
  HeadphonesIcon,
  House,
  IdCard,
  KeyRound,
  Mail,
  MapPin,
  MessageSquareMore,
  Phone,
  QrCode,
  ScrollText,
  SendHorizontal,
  Smile,
  Smartphone,
  Syringe,
  Trash2,
  UserCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import themeTokens from "../../Themetokens";

const inlineIconMap = {
  wave: Hand,
  calendar: CalendarDays,
  phone: Phone,
  mobile: Smartphone,
  mail: Mail,
  facebook: Facebook,
  trash: Trash2,
  syringe: Syringe,
  idcard: IdCard,
  smile: Smile,
  map: MapPin,
  file: FileText,
  list: ClipboardList,
  qr: QrCode,
  user: UserCircle,
  users: Users,
  check: UserCheck,
  chart: BarChart2,
  house: House,
  scroll: ScrollText,
  key: KeyRound,
  headset: HeadphonesIcon,
};

const FAQChatbot = ({ currentTheme }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! [[wave]] I'm E-Kap, your Barangay assistant. How can I help you today?",
      links: [],
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [conversationEnded, setConversationEnded] = useState(false);
  const messagesEndRef = useRef(null);
  const replyTimeoutRef = useRef(null);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const shellSurface = isDark
    ? "bg-slate-950/95 border-slate-700/80"
    : "bg-white/95 border-slate-200/90";
  const shellHeader = isDark
    ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
    : `bg-gradient-to-r ${t.modalHeaderGrad}`;
  const bodySurface = isDark
    ? "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"
    : "bg-gradient-to-b from-slate-50 via-white to-slate-50";
  const botBubble = isDark
    ? "bg-slate-800/95 border border-slate-700 text-slate-100"
    : "bg-white border border-slate-200 text-slate-800";
  const quickPanel = isDark
    ? "bg-slate-900/85 border-slate-800"
    : "bg-white/85 border-slate-200";
  const quickPill = isDark
    ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700";
  const inputPanel = isDark
    ? "bg-slate-950/90 border-slate-800"
    : "bg-white/90 border-slate-200";
  const inputField = isDark
    ? "bg-slate-800 text-slate-100 border-slate-700 placeholder-slate-500"
    : "bg-white text-slate-900 border-slate-200 placeholder-slate-400";
  const timestampText = isDark ? "text-slate-400" : "text-slate-500";

  const faqDatabase = {
    greetings: {
      keywords: [
        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        "kumusta",
        "musta",
      ],
      response:
        "Hello! [[wave]] I'm E-Kap, your Barangay assistant. How can I help you today?\n\nI can assist you with:\n- Reporting incidents & filing complaints\n- Requesting documents online (BID, COI, COR)\n- Tracking your case or document request\n- Barangay services & schedules",
      links: [
        { label: "Report an Incident", path: "/incident-complaint/incident-report" },
        { label: "Document Services", path: "/sub-system-2" },
      ],
    },
    "incident-report": {
      keywords: [
        "incident",
        "report an incident",
        "emergency",
        "accident",
        "public safety",
        "nuisance",
        "environmental",
        "health hazard",
        "pano mag report",
        "paano mag report",
        "mag-report",
      ],
      response:
        "To report an incident online:\n1. Go to the Incident Report page\n2. Select an incident category:\n   - Public Safety & Traffic\n   - Public Nuisance\n   - Environmental Hazards\n   - Health Hazards\n3. Pin the exact location on the map\n4. Describe the incident and attach photos/videos\n5. Submit — you'll receive a case number\n\nTrack your report's status anytime in Case Management.",
      links: [
        { label: "Report an Incident", path: "/incident-complaint/incident-report" },
        { label: "Case Management", path: "/incident-complaint/case-management" },
      ],
    },
    "file-complaint": {
      keywords: [
        "complaint",
        "file complaint",
        "reklamo",
        "dispute",
        "blotter",
        "away",
        "mediation",
        "lupon",
        "file a complaint",
        "mag-reklamo",
        "magsampa",
        "police",
      ],
      response:
        "To file a complaint online:\n1. Go to the File a Complaint page\n2. Submit the facts and names of all parties involved\n3. Prepare and upload supporting evidence\n4. Submit your complaint form\n5. Receive your case number for tracking\n\nA mediation session will be scheduled within 3-5 days. Monitor all updates in Case Management.",
      links: [
        { label: "File a Complaint", path: "/incident-complaint/file-complaint" },
        { label: "Case Management", path: "/incident-complaint/case-management" },
      ],
    },
    "case-tracker": {
      keywords: [
        "track",
        "case",
        "status",
        "case number",
        "tracker",
        "case management",
        "appointment",
        "follow up",
        "update",
        "monitor",
        "ongoing",
        "resolved",
      ],
      response:
        "To track your case or complaint:\n[[list]] Go to the Case Management page\n[[list]] View all filed incidents and complaints\n[[list]] Filter by status: Ongoing or Resolved\n[[list]] Check your appointments (mediation sessions)\n[[list]] Appointment statuses: Scheduled, Completed, Rescheduled, Cancelled\n\nUse your case number to search for a specific case.",
      links: [
        { label: "Case Management", path: "/incident-complaint/case-management" },
      ],
    },
    "incident-map": {
      keywords: [
        "map",
        "incident map",
        "mapa",
        "location map",
        "where incident",
        "view map",
        "nearby",
      ],
      response:
        "The Incident Map shows reported incidents across the Barangay:\n[[map]] Go to the Incident Map page\n[[map]] View incidents as markers on an interactive map\n[[map]] Filter by status: Active, In Progress, or Resolved\n[[map]] Tap any marker to see incident details\n\nThis helps the community stay aware of active situations nearby.",
      links: [
        { label: "View Incident Map", path: "/incident-complaint/incident-map" },
      ],
    },
    "document-services": {
      keywords: [
        "document",
        "request document",
        "online request",
        "request online",
        "dokumento",
        "e-services",
        "online services",
      ],
      response:
        "Request documents online through the Document Services section:\n[[file]] Barangay ID (BID) — Request BID\n[[file]] Certificate of Indigency (COI) — Request COI\n[[file]] Certificate of Residency (COR) — Request COR\n\nAfter submitting, track your request status in the tracking section. You will be notified when your document is ready for pickup at the Barangay Hall.",
      links: [
        { label: "Request BID", path: "/sub-system-2/req-bid" },
        { label: "Request COI", path: "/sub-system-2/req-coi" },
        { label: "Request COR", path: "/sub-system-2/req-cor" },
      ],
    },
    "barangay-id": {
      keywords: [
        "barangay id",
        "bid",
        "identification card",
        "id card",
        "request id",
        "id",
        "identification",
      ],
      response:
        "Barangay ID (BID) Request:\n[[idcard]] Request online at the Document Services page\n\nRequirements:\n- 2 pcs 1x1 photo\n- Birth certificate\n- Proof of residency\n- Fee: PHP 30\n\nProcessing: 7-10 business days | Valid for: 3 years\n\nTrack your request status in Track BID.",
      links: [
        { label: "Request BID", path: "/sub-system-2/req-bid" },
        { label: "Track BID", path: "/sub-system-2/track-bid" },
      ],
    },
    "certificate-of-indigency": {
      keywords: [
        "indigency",
        "coi",
        "certificate of indigency",
        "financial assistance",
        "ayuda",
        "tulong",
        "scholarship",
        "medical assistance",
      ],
      response:
        "Certificate of Indigency (COI):\nRequired for: Medical assistance, scholarship applications, legal aid\n\n[[file]] Request online at the Document Services page\n\nRequirements:\n1. Valid ID\n2. Proof of residence\n3. Supporting documents (medical records, bills, etc.)\n\nProcessing: 1-2 business days. No fee required.\nTrack your request in Track COI.",
      links: [
        { label: "Request COI", path: "/sub-system-2/req-coi" },
        { label: "Track COI", path: "/sub-system-2/track-coi" },
      ],
    },
    "certificate-of-residency": {
      keywords: [
        "residency",
        "cor",
        "certificate of residency",
        "proof of residency",
        "resident certificate",
        "clearance",
        "barangay clearance",
        "cedula",
      ],
      response:
        "Certificate of Residency (COR):\nProof that you are an official resident of the Barangay.\n\n[[file]] Request online at the Document Services page\n\nRequirements:\n1. Valid ID\n2. Proof of current address\n\nProcessing: 1-3 business days\nTrack your request in Track COR.",
      links: [
        { label: "Request COR", path: "/sub-system-2/req-cor" },
        { label: "Track COR", path: "/sub-system-2/track-cor" },
      ],
    },
    "business-permit": {
      keywords: [
        "business",
        "permit",
        "negosyo",
        "business permit",
        "tindahan",
      ],
      response:
        "Business Permit Requirements:\n1. Barangay Business Clearance application form\n2. Valid ID of business owner\n3. Proof of business location\n4. Payment of permit fee (varies by business type)\n\nProcessing time: 5-7 business days. Visit the Business Permits section at the Barangay Hall.",
      links: [],
    },
    "operating-hours": {
      keywords: [
        "hours",
        "open",
        "close",
        "schedule",
        "office hours",
        "oras",
        "when open",
        "anong oras",
      ],
      response:
        "Barangay Hall Operating Hours:\n[[calendar]] Monday - Friday: 8:00 AM - 5:00 PM\n[[calendar]] Saturday: 8:00 AM - 12:00 PM\n[[calendar]] Sunday and Holidays: Closed\n\nEmergency Hotline (24/7): 0917-XXX-XXXX",
      links: [],
    },
    contact: {
      keywords: [
        "contact",
        "phone",
        "email",
        "number",
        "reach",
        "call",
        "makipag-ugnayan",
      ],
      response:
        "Contact Information:\n[[phone]] Landline: (02) 8XXX-XXXX\n[[mobile]] Mobile: 0917-XXX-XXXX\n[[mail]] Email: barangay@example.com\n[[facebook]] Facebook: @BarangayOfficial\n\nYou can also visit us at the Barangay Hall during office hours.",
      links: [],
    },
    "garbage-collection": {
      keywords: [
        "garbage",
        "basura",
        "trash",
        "collection",
        "waste",
        "kalat",
      ],
      response:
        "Garbage Collection Schedule:\n[[trash]] Biodegradable: Monday, Wednesday, Friday\n[[trash]] Non-biodegradable: Tuesday, Thursday\n[[trash]] Recyclables: Saturday\n\nCollection time: 6:00 AM - 10:00 AM\nPlease segregate your waste properly!",
      links: [],
    },
    vaccination: {
      keywords: [
        "vaccine",
        "vaccination",
        "bakuna",
        "covid",
        "immunization",
        "health center",
      ],
      response:
        "Vaccination Services:\n[[syringe]] Location: Barangay Health Center\n[[syringe]] Schedule: Every Tuesday and Thursday, 9AM-3PM\n[[syringe]] Required: Valid ID and health card\n\nServices include COVID-19 vaccines, flu shots, and routine immunizations for children.",
      links: [],
    },
    "register-account": {
      keywords: [
        "register",
        "sign up",
        "signup",
        "create account",
        "new account",
        "mag-register",
        "paano mag-sign up",
        "how to register",
        "new user",
      ],
      response:
        "To create a Barangay account:\n1. Go to the Login page\n2. Click the Register tab\n3. Fill in your personal details\n4. Submit your registration\n\nNote: Your account will be linked to your resident record. Make sure you are already registered as a resident of the Barangay before signing up.",
      links: [
        { label: "Go to Login / Register", path: "/login" },
      ],
    },
    "profile": {
      keywords: [
        "profile",
        "my info",
        "my information",
        "personal info",
        "update profile",
        "edit profile",
        "my details",
        "my account",
        "account info",
        "personal details",
      ],
      response:
        "Your profile shows your complete resident information:\n[[user]] Personal Info — name, birthday, sex, civil status\n[[user]] Contact — email and phone number\n[[user]] Address — house number, purok, street\n[[user]] Family Info — household head and relationship\n[[user]] Resident Status — sector, indigent status\n\nYou can also upload a profile photo, change your password, generate your QR code, and view your activity logs.",
      links: [
        { label: "View My Profile", path: "/profile" },
      ],
    },
    "change-password": {
      keywords: [
        "password",
        "change password",
        "update password",
        "forgot password",
        "reset password",
        "new password",
        "palitan ang password",
        "passcode",
      ],
      response:
        "To change your password:\n[[key]] Go to your Profile page\n[[key]] Click the menu icon (top right of your profile)\n[[key]] Select 'Change Password'\n[[key]] Enter your current password and your new password\n[[key]] Confirm and save\n\nIf you forgot your password, use the 'Forgot Password' link on the Login page to reset it via email.",
      links: [
        { label: "Go to My Profile", path: "/profile" },
        { label: "Login / Forgot Password", path: "/login" },
      ],
    },
    "qr-code": {
      keywords: [
        "qr",
        "qr code",
        "qr code ko",
        "generate qr",
        "scan",
        "scanner",
        "identification code",
        "download qr",
        "my qr",
      ],
      response:
        "Your Barangay QR Code is a digital ID you can use for identification:\n[[qr]] Go to your Profile page\n[[qr]] Click the menu icon (top right)\n[[qr]] Select 'Generate QR Code'\n[[qr]] Download as SVG or PNG\n\nYour QR code contains your resident information and can be scanned by Barangay officials for quick verification.",
      links: [
        { label: "Go to My Profile", path: "/profile" },
      ],
    },
    "verification-status": {
      keywords: [
        "verify",
        "verification",
        "verified",
        "not verified",
        "verification status",
        "residency verification",
        "how to verify",
        "submit verification",
        "pending verification",
        "i-verify",
      ],
      response:
        "Resident verification confirms your identity and residency:\n[[check]] Go to the Verification page to view submission statuses\n[[check]] Submit valid ID documents for review\n[[check]] Your submission will be reviewed by a Barangay official\n\nVerification statuses:\n- Pending — waiting for review\n- For Visit — Barangay will schedule a home visit\n- Approved — you are now a verified resident\n- Rejected — resubmit with clearer documents\n\nNote: Only verified residents can be issued certificates automatically.",
      links: [],
    },
    "household-info": {
      keywords: [
        "household",
        "pamilya",
        "family members",
        "household members",
        "household id",
        "head of family",
        "household record",
        "household info",
        "view household",
        "aking pamilya",
      ],
      response:
        "The Household Records page shows all registered households in the Barangay:\n[[house]] Search by Head of Family name or Household ID\n[[house]] Filter by Purok, Tenure Status, or Indigent/General\n[[house]] Click a record to view all household members\n[[house]] View member details: name, relationship, age\n\nYour household information is also visible in your Profile under 'Family Information'.",
      links: [
        { label: "View My Profile", path: "/profile" },
      ],
    },
    "residents-registry": {
      keywords: [
        "residents",
        "resident list",
        "resident registry",
        "listahan ng residente",
        "registered residents",
        "resident records",
        "population",
        "purok",
      ],
      response:
        "The Residents Registry contains all registered residents of the Barangay:\n[[users]] Search by name or Resident ID\n[[users]] Filter by Purok, Category (PWD, Senior, OFW, etc.), or Residency Status\n[[users]] View resident details and household information\n[[users]] Export or print the masterlist with applied filters\n\nCategories include: PWD, Seniors, Solo Parent, OFW, Youth, and more.",
      links: [],
    },
    "dashboard-analytics": {
      keywords: [
        "dashboard",
        "analytics",
        "statistics",
        "data",
        "heatmap",
        "demographics",
        "population data",
        "reports",
        "insights",
        "chart",
        "livelihood",
        "sectors",
      ],
      response:
        "The Dashboard provides barangay-wide analytics and reports:\n[[chart]] Heatmap — population density map by Purok\n[[chart]] Demographics — age, gender, and sector breakdown\n[[chart]] Sectors — PWD, Seniors, Solo Parents, OFW, etc.\n[[chart]] Registration — resident registration trends over time\n[[chart]] Livelihood — economic and livelihood data\n[[chart]] Insights — decision guide recommendations\n\nData refreshes in real time. Use the Refresh button to load the latest data.",
      links: [
        { label: "Go to Dashboard", path: "/dashboard" },
      ],
    },
    "barangay-certificates": {
      keywords: [
        "barangay clearance",
        "clearance",
        "first time jobseeker",
        "jobseeker",
        "ra 11261",
        "certificate request",
        "issue certificate",
        "mag-request ng certificate",
        "how to get certificate",
      ],
      response:
        "Certificates available at the Barangay:\n[[scroll]] Barangay Clearance\n[[scroll]] Certificate of Indigency (COI)\n[[scroll]] Certificate of Residency (COR)\n[[scroll]] First Time Jobseeker (RA 11261)\n\nFor online requests, use the Document Services section. For on-site issuance, visit the Barangay Hall — an official will search your name and print the certificate directly.\n\nNote: Only verified residents can be issued certificates automatically.",
      links: [
        { label: "Request COI Online", path: "/sub-system-2/req-coi" },
        { label: "Request COR Online", path: "/sub-system-2/req-cor" },
      ],
    },
    "support-help": {
      keywords: [
        "help",
        "support",
        "problem",
        "issue with system",
        "technical",
        "tulong",
        "contact support",
        "not working",
        "error",
        "bug",
        "report a problem",
      ],
      response:
        "For help and support:\n[[headset]] Go to the Support page for FAQs and system tips\n[[headset]] Emergency Contacts:\n   - Police Station: 911\n   - Bureau of Fire: 117\n[[headset]] Technical Support Email: support@brgysystem.ph\n\nIf you're experiencing a system issue, try refreshing the page or clearing your browser cache. For unresolved issues, contact our technical support team.",
      links: [
        { label: "Go to Support Page", path: "/support" },
      ],
    },
    thanks: {
      keywords: [
        "thank",
        "thanks",
        "salamat",
        "thank you",
        "maraming salamat",
      ],
      response:
        "You're welcome! If you have any other questions about Barangay services, feel free to ask. Have a great day! [[smile]]",
      links: [],
    },
  };

  const quickQuestions = [
    "How to report an incident?",
    "How to file a complaint?",
    "Request documents online",
    "Track my case",
    "Generate my QR code",
    "View my household info",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(
    () => () => {
      if (replyTimeoutRef.current) {
        window.clearTimeout(replyTimeoutRef.current);
      }
    },
    [],
  );

  const findAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();

    for (const category in faqDatabase) {
      const faq = faqDatabase[category];
      const hasKeyword = faq.keywords.some((keyword) =>
        lowerQuestion.includes(keyword.toLowerCase()),
      );

      if (hasKeyword) return { text: faq.response, links: faq.links || [] };
    }

    return {
      text: "I'm not sure about that. Here are some topics I can help with:\n\nResident Services:\n- Register an Account\n- Profile & Personal Info\n- Change Password\n- QR Code / Digital ID\n- Verification Status\n- Household Information\n- Residents Registry\n- Dashboard & Analytics\n\nIncident & Complaint System:\n- Incident Reporting\n- Filing a Complaint\n- Case Tracking\n- Incident Map\n\nDocument Services:\n- Barangay Certificates (COI, COR, Clearance, Jobseeker)\n- Barangay ID (BID) Request\n\nBarangay Info:\n- Office Hours & Contact\n- Garbage Collection\n- Vaccination Services\n- Help & Support\n\nPlease rephrase your question or contact our office directly at 0917-XXX-XXXX.",
      links: [
        { label: "Help & Support", path: "/support" },
      ],
    };
  };

  const pushFollowup = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: "followup", answered: false, timestamp: new Date() },
      ]);
    }, 700);
  };

  const handleYes = (followupIndex) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === followupIndex ? { ...m, answered: true } : m))
    );
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Of course! [[wave]] What else would you like to know?",
          links: [],
          timestamp: new Date(),
        },
      ]);
      setShowQuickQuestions(true);
    }, 400);
  };

  const handleNo = (followupIndex) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === followupIndex ? { ...m, answered: true } : m))
    );
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Alright! Feel free to come back anytime you need help. Have a great day! [[smile]]",
          links: [],
          timestamp: new Date(),
        },
      ]);
      setConversationEnded(true);
    }, 400);
  };

  const handleNewConversation = () => {
    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }

    setMessages([
      {
        type: "bot",
        text: "Hello! [[wave]] I'm E-Kap, your Barangay assistant. How can I help you today?",
        links: [],
        timestamp: new Date(),
      },
    ]);
    setShowQuickQuestions(true);
    setConversationEnded(false);
    setIsTyping(false);
  };

  const queueBotReply = (question) => {
    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
    }

    setIsTyping(true);

    replyTimeoutRef.current = window.setTimeout(() => {
      const { text, links } = findAnswer(question);
      const botMessage = {
        type: "bot",
        text,
        links,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      replyTimeoutRef.current = null;
      pushFollowup();
    }, 1000);
  };

  const submitMessage = (question) => {
    const outbound = String(question || "").trim();
    if (!outbound || isTyping) return;

    const userMessage = {
      type: "user",
      text: outbound,
      links: [],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setShowQuickQuestions(false);
    queueBotReply(outbound);
  };

  const handleSend = () => {
    submitMessage(inputValue);
  };

  const handleQuickQuestion = (question) => {
    submitMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageText = (text, isUser = false) => {
    const lines = String(text || "").split("\n");
    const iconColor = isUser ? "text-white/90" : t.primaryText;

    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\[\[[a-z-]+\]\])/g).filter(Boolean);

      return (
        <React.Fragment key={`line-${lineIndex}`}>
          {parts.map((part, partIndex) => {
            const match = part.match(/^\[\[([a-z-]+)\]\]$/);
            if (!match) {
              return <React.Fragment key={`text-${lineIndex}-${partIndex}`}>{part}</React.Fragment>;
            }

            const Icon = inlineIconMap[match[1]];
            if (!Icon) return null;

            return (
              <span
                key={`icon-${lineIndex}-${partIndex}`}
                className={`inline-flex align-middle mx-0.5 ${iconColor}`}
              >
                <Icon size={14} strokeWidth={2.2} />
              </span>
            );
          })}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-4 sm:bottom-10 sm:right-7 z-[1550] inline-flex items-center gap-2 h-12 w-auto px-4 sm:px-0 sm:h-14 sm:w-14 sm:justify-center rounded-full bg-gradient-to-br ${t.primaryGrad} text-white shadow-[0_16px_40px_rgba(15,23,42,0.28)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 border border-white/20`}
          aria-label="Open FAQ Chatbot"
        >
          <Bot className="w-5 h-5 flex-shrink-0" strokeWidth={2.1} />
          <span className="text-[13px] font-kumbh font-semibold tracking-tight sm:hidden">
            Ask E-Kap
          </span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        </button>
      )}

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-[1549] sm:hidden bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`fixed bottom-0 left-0 right-0 sm:bottom-10 sm:right-7 sm:left-auto sm:w-[23rem] z-[1550] ${shellSurface} rounded-t-[28px] sm:rounded-[24px] shadow-[0_-8px_40px_rgba(15,23,42,0.12)] sm:shadow-[0_28px_80px_rgba(15,23,42,0.28)] border-t border-x sm:border border-slate-200/80 backdrop-blur-xl flex flex-col animate-slideUp font-kumbh overflow-hidden text-left`}
            style={{
              height: "min(600px, 82svh)",
              maxHeight: "82svh",
            }}
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className={`w-10 h-1 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-300/80"}`} />
            </div>

          <div
            className={`${shellHeader} px-4 py-3.5 border-b ${t.cardBorder} flex items-center justify-between flex-shrink-0 backdrop-blur-xl`}
          >
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${t.primaryGrad} flex items-center justify-center shadow-[0_12px_30px_rgba(15,23,42,0.16)]`}
              >
                <MessageSquareMore className="w-4 h-4 text-white" strokeWidth={2.1} />
              </div>
              <div>
                <h3 className={`font-spartan font-semibold text-[15px] tracking-tight ${t.cardText}`}>
                  E-Kap
                </h3>
                <p className={`text-[11px] font-kumbh ${t.subtleText}`}>
                  Barangay assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-xl border ${t.cardBorder} ${t.cardText} ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"} active:scale-95 transition-all`}
            >
              <X className="w-4 h-4" strokeWidth={2.1} />
            </button>
          </div>

          <div
            className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 ${bodySurface}`}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "followup" ? (
                  <div className="max-w-[80%] sm:max-w-[75%] flex flex-col items-start">
                    <div className={`${botBubble} shadow-[0_10px_24px_rgba(15,23,42,0.08)] rounded-[20px] px-3.5 py-3`}>
                      {!message.answered ? (
                        <>
                          <p className="text-xs font-kumbh mb-3 leading-5">
                            Is there anything else I can help you with?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleYes(index)}
                              className={`flex-1 text-[11px] font-kumbh font-semibold py-2 rounded-xl transition-all active:scale-95 bg-gradient-to-br ${t.primaryGrad} text-white`}
                            >
                              Yes, I have more
                            </button>
                            <button
                              onClick={() => handleNo(index)}
                              className={`flex-1 text-[11px] font-kumbh font-semibold py-2 rounded-xl transition-all active:scale-95 border ${t.cardBorder} ${isDark ? "bg-slate-700/60 text-slate-200" : "bg-slate-100 text-slate-600"}`}
                            >
                              No, I'm done
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className={`text-[11px] font-kumbh ${t.subtleText} italic`}>
                          Answered
                        </p>
                      )}
                    </div>
                    <span className={`text-[10px] mt-1 px-1 font-kumbh ${timestampText}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ) : (
                  <div className={`max-w-[80%] sm:max-w-[75%] flex flex-col ${message.type === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`${
                        message.type === "user"
                          ? `bg-gradient-to-br ${t.primaryGrad} text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)]`
                          : `${botBubble} shadow-[0_10px_24px_rgba(15,23,42,0.08)]`
                      } rounded-[20px] px-3.5 py-2.5 text-left`}
                    >
                      <p className="text-xs font-kumbh whitespace-pre-line break-words leading-6 text-left">
                        {renderMessageText(message.text, message.type === "user")}
                      </p>
                      {message.type === "bot" && message.links && message.links.length > 0 && (
                        <div className={`mt-2.5 pt-2.5 border-t ${isDark ? "border-slate-700" : "border-slate-200/80"} flex flex-col gap-1.5`}>
                          {message.links.map((link, linkIndex) => (
                            <button
                              key={linkIndex}
                              onClick={() => navigate(link.path)}
                              className={`flex items-center justify-between gap-2 w-full px-2.5 py-1.5 rounded-xl text-[11px] font-kumbh font-medium transition-all text-left ${
                                isDark
                                  ? "bg-slate-700/60 hover:bg-slate-700 text-slate-200"
                                  : `bg-gradient-to-r ${t.primaryLight} ${t.primaryText} hover:opacity-90`
                              }`}
                            >
                              <span>{link.label}</span>
                              <ArrowRight size={11} strokeWidth={2.4} className="flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-1 px-1 font-kumbh ${
                        message.type === "user" ? "text-slate-400" : timestampText
                      } ${message.type === "user" ? "text-right" : "text-left"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div
                  className={`${botBubble} rounded-[20px] px-3.5 py-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]`}
                >
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {showQuickQuestions && (
            <div className={`px-4 pt-3 pb-4 border-t ${t.cardBorder} ${quickPanel} flex-shrink-0 backdrop-blur-xl`}>
              <p className={`text-[11px] ${t.subtleText} mb-2.5 font-kumbh font-medium flex items-center gap-1.5`}>
                <CircleHelp size={12} className={t.primaryText} strokeWidth={2.1} />
                Quick questions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className={`text-[11px] px-3 py-2.5 border rounded-2xl transition-colors font-kumbh font-normal text-center leading-snug ${quickPill}`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {conversationEnded ? (
            <div className={`px-4 py-4 border-t ${t.cardBorder} ${inputPanel} flex-shrink-0 backdrop-blur-xl flex flex-col items-center gap-2.5`}>
              <p className={`text-[11px] font-kumbh ${t.subtleText} text-center`}>
                This conversation has ended.
              </p>
              <button
                onClick={handleNewConversation}
                className={`text-[12px] font-kumbh font-semibold px-5 py-2 rounded-2xl bg-gradient-to-br ${t.primaryGrad} text-white active:scale-95 transition-all shadow-sm`}
              >
                Start a new conversation
              </button>
            </div>
          ) : (
            <div className={`px-4 py-3.5 border-t ${t.cardBorder} ${inputPanel} flex-shrink-0 backdrop-blur-xl`}>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className={`flex-1 px-4 py-2.5 border rounded-2xl ${inputField} focus:outline-none outline-none focus:ring-1 ring-offset-0 ${t.primaryRing} ${t.primaryBorder} transition-all text-[13px] font-kumbh`}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={`p-2.5 bg-gradient-to-br ${t.primaryGrad} text-white rounded-2xl hover:shadow-[0_12px_24px_rgba(15,23,42,0.18)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
                >
                  <SendHorizontal className="w-4 h-4" strokeWidth={2.1} />
                </button>
              </div>
            </div>
          )}
          </div>
        </>
      )}

      <style >{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 639px) {
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
        .animate-slideUp {
          animation: slideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .chatbot-no-scrollbar::-webkit-scrollbar { display: none; }
        .chatbot-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default FAQChatbot;


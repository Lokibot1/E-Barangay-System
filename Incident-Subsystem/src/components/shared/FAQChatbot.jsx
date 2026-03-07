import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  CalendarDays,
  CircleHelp,
  Facebook,
  Hand,
  IdCard,
  Mail,
  MessageSquareMore,
  Phone,
  SendHorizontal,
  Smile,
  Smartphone,
  Syringe,
  Trash2,
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
};

const FAQChatbot = ({ currentTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! [[wave]] I'm E-Kap, your Barangay assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

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
      ],
      response:
        "Hello! I'm E-Kap, your Barangay assistant. How can I assist you with Barangay services today? Feel free to ask about incident reporting, barangay clearance, permits, or any other concerns.",
    },
    "incident-report": {
      keywords: [
        "incident",
        "report",
        "emergency",
        "accident",
        "hazard",
        "pano mag report",
        "paano mag report",
      ],
      response:
        "To report an incident:\n1. Click 'Report New Incident' button\n2. Fill out the multi-step form with incident details\n3. Upload photos or videos if available\n4. Submit for review\n\nYour report will be reviewed within 24 hours. You can track its status in the Case Tracker page.",
    },
    "barangay-clearance": {
      keywords: ["clearance", "barangay clearance", "certificate", "cedula"],
      response:
        "To get a Barangay Clearance:\n1. Visit the Barangay Hall from Monday-Friday, 8AM-5PM\n2. Bring valid ID and proof of residency\n3. Pay the clearance fee (PHP 50)\n4. Processing takes 1-3 business days\n\nFor faster service, you can also request online through our e-services portal.",
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
    },
    "operating-hours": {
      keywords: ["hours", "open", "close", "schedule", "office hours", "oras"],
      response:
        "Barangay Hall Operating Hours:\n[[calendar]] Monday - Friday: 8:00 AM - 5:00 PM\n[[calendar]] Saturday: 8:00 AM - 12:00 PM\n[[calendar]] Sunday and Holidays: Closed\n\nEmergency Hotline (24/7): 0917-XXX-XXXX",
    },
    contact: {
      keywords: ["contact", "phone", "email", "number", "reach", "call"],
      response:
        "Contact Information:\n[[phone]] Landline: (02) 8XXX-XXXX\n[[mobile]] Mobile: 0917-XXX-XXXX\n[[mail]] Email: barangay@example.com\n[[facebook]] Facebook: @BarangayOfficial\n\nYou can also visit us at the Barangay Hall during office hours.",
    },
    "garbage-collection": {
      keywords: [
        "garbage",
        "basura",
        "trash",
        "collection",
        "schedule",
        "waste",
      ],
      response:
        "Garbage Collection Schedule:\n[[trash]] Biodegradable: Monday, Wednesday, Friday\n[[trash]] Non-biodegradable: Tuesday, Thursday\n[[trash]] Recyclables: Saturday\n\nCollection time: 6:00 AM - 10:00 AM\nPlease segregate your waste properly!",
    },
    vaccination: {
      keywords: ["vaccine", "vaccination", "bakuna", "covid", "immunization"],
      response:
        "Vaccination Services:\n[[syringe]] Location: Barangay Health Center\n[[syringe]] Schedule: Every Tuesday and Thursday, 9AM-3PM\n[[syringe]] Required: Valid ID and health card\n\nServices include COVID-19 vaccines, flu shots, and routine immunizations for children.",
    },
    blotter: {
      keywords: [
        "blotter",
        "complaint",
        "dispute",
        "away",
        "reklamo",
        "police",
      ],
      response:
        "To file a Barangay Blotter:\n1. Visit the Barangay Hall\n2. Go to the Lupon or Peacekeeping Office\n3. Present valid IDs of involved parties\n4. Describe the incident to the Barangay official\n\nMediation sessions are scheduled within 3-5 days. Bring any evidence or witnesses.",
    },
    indigency: {
      keywords: ["indigency", "financial", "assistance", "ayuda", "tulong"],
      response:
        "Certificate of Indigency:\nRequired for: Medical assistance, scholarship applications, legal aid\n\nRequirements:\n1. Accomplished application form\n2. Valid ID\n3. Proof of residence\n4. Supporting documents (medical records, bills, etc.)\n\nProcessing: 1-2 business days. No fee required.",
    },
    id: {
      keywords: ["barangay id", "id", "identification", "card"],
      response:
        "Barangay ID Application:\n[[idcard]] Requirements:\n- 2 pcs 1x1 photo\n- Birth certificate\n- Proof of residency\n- Fee: PHP 30\n\nProcessing: 7-10 business days\nValid for: 3 years\n\nVisit the ID section during office hours.",
    },
    thanks: {
      keywords: ["thank", "thanks", "salamat", "thank you"],
      response:
        "You're welcome! If you have any other questions about Barangay services, feel free to ask. Have a great day! [[smile]]",
    },
  };

  const quickQuestions = [
    "How to report an incident?",
    "Barangay clearance requirements",
    "Office hours",
    "Contact information",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();

    for (const category in faqDatabase) {
      const faq = faqDatabase[category];
      const hasKeyword = faq.keywords.some((keyword) =>
        lowerQuestion.includes(keyword.toLowerCase()),
      );

      if (hasKeyword) return faq.response;
    }

    return "I'm not sure about that. Here are some topics I can help with:\n\n- Incident Reporting\n- Barangay Clearance\n- Business Permits\n- Office Hours\n- Garbage Collection\n- Vaccination Services\n- Barangay Blotter\n- Certificate of Indigency\n- Barangay ID\n\nPlease rephrase your question or contact our office directly at 0917-XXX-XXXX.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const outbound = inputValue;
    const userMessage = {
      type: "user",
      text: outbound,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botMessage = {
        type: "bot",
        text: findAnswer(outbound),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuestion = (question) => {
    const userMessage = {
      type: "user",
      text: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botMessage = {
        type: "bot",
        text: findAnswer(question),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
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
          className={`fixed bottom-7 sm:bottom-8 right-3 sm:right-4 z-[1550] inline-flex h-14 w-14 sm:h-[60px] sm:w-[60px] items-center justify-center rounded-full bg-gradient-to-br ${t.primaryGrad} text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 transition-all duration-300 group border border-white/20`}
          aria-label="Open FAQ Chatbot"
        >
          <Bot className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.1} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 right-3 sm:bottom-7 sm:right-4 w-[calc(100vw-1.5rem)] sm:w-[24rem] z-[1550] ${shellSurface} rounded-[28px] shadow-[0_28px_80px_rgba(15,23,42,0.28)] border backdrop-blur-xl flex flex-col animate-slideUp font-kumbh overflow-hidden text-left`}
          style={{ maxHeight: "calc(100vh - 4.5rem)", height: "620px" }}
        >
          <div
            className={`${shellHeader} px-4 sm:px-5 py-4 border-b ${t.cardBorder} flex items-center justify-between flex-shrink-0 backdrop-blur-xl`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.primaryGrad} flex items-center justify-center shadow-[0_12px_30px_rgba(15,23,42,0.16)]`}
              >
                <MessageSquareMore className="w-5 h-5 text-white" strokeWidth={2.1} />
              </div>
              <div>
                <h3 className={`font-spartan font-semibold text-base tracking-tight ${t.cardText}`}>
                  E-Kap
                </h3>
                <p className={`text-xs font-kumbh ${t.subtleText}`}>
                  Barangay assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-xl border ${t.cardBorder} ${t.cardText} ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"} transition-colors`}
            >
              <X className="w-5 h-5" strokeWidth={2.1} />
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
                <div className={`max-w-[80%] sm:max-w-[75%] flex flex-col ${message.type === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`${
                      message.type === "user"
                        ? `bg-gradient-to-br ${t.primaryGrad} text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)]`
                        : `${botBubble} shadow-[0_10px_24px_rgba(15,23,42,0.08)]`
                    } rounded-[22px] px-4 py-3 text-left`}
                  >
                    <p className="text-[13px] font-kumbh whitespace-pre-line break-words leading-7 text-left">
                      {renderMessageText(message.text, message.type === "user")}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 px-1 font-kumbh ${
                      message.type === "user"
                        ? "text-slate-400"
                        : timestampText
                    } ${message.type === "user" ? "text-right" : "text-left"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div
                  className={`${botBubble} rounded-[22px] px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]`}
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

          {messages.length === 1 && (
            <div className={`px-4 sm:px-5 py-3.5 border-t ${t.cardBorder} ${quickPanel} flex-shrink-0 backdrop-blur-xl`}>
              <p className={`text-xs ${t.subtleText} mb-2.5 font-kumbh font-medium flex items-center gap-1.5`}>
                <CircleHelp size={13} className={t.primaryText} strokeWidth={2.1} />
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className={`text-xs px-3.5 py-2 border rounded-full transition-colors font-kumbh font-normal ${quickPill}`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={`p-3.5 sm:p-4 border-t ${t.cardBorder} ${inputPanel} flex-shrink-0 backdrop-blur-xl`}>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className={`flex-1 px-4 py-3 border rounded-2xl ${inputField} focus:outline-none outline-none focus:ring-1 ring-offset-0 ${t.primaryRing} ${t.primaryBorder} transition-all text-sm font-kumbh`}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={`p-3 bg-gradient-to-br ${t.primaryGrad} text-white rounded-2xl hover:shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
              >
                <SendHorizontal className="w-5 h-5" strokeWidth={2.1} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default FAQChatbot;


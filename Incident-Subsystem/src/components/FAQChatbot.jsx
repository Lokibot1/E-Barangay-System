import React, { useState, useEffect, useRef } from "react";
import themeTokens from "../Themetokens";

const FAQChatbot = ({ currentTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! 👋 I'm E-Kap, your Barangay Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  // FAQ Database
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
        "Hello! I'm E-Kap, your Barangay Assistant. How can I assist you with Barangay services today? Feel free to ask about incident reporting, barangay clearance, permits, or any other concerns.",
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
        "To report an incident:\n1. Click 'Report New Incident' button\n2. Fill out the multi-step form with incident details\n3. Upload photos/videos if available\n4. Submit for review\n\nYour report will be reviewed within 24 hours. You can track its status in the Case Management page.",
    },
    "barangay-clearance": {
      keywords: ["clearance", "barangay clearance", "certificate", "cedula"],
      response:
        "To get a Barangay Clearance:\n1. Visit the Barangay Hall from Monday-Friday, 8AM-5PM\n2. Bring valid ID and proof of residency\n3. Pay the clearance fee (₱50)\n4. Processing takes 1-3 business days\n\nFor faster service, you can also request online through our e-services portal.",
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
        "Barangay Hall Operating Hours:\n📅 Monday - Friday: 8:00 AM - 5:00 PM\n📅 Saturday: 8:00 AM - 12:00 PM\n📅 Sunday & Holidays: Closed\n\nEmergency Hotline (24/7): 0917-XXX-XXXX",
    },
    contact: {
      keywords: ["contact", "phone", "email", "number", "reach", "call"],
      response:
        "Contact Information:\n📞 Landline: (02) 8XXX-XXXX\n📱 Mobile: 0917-XXX-XXXX\n✉️ Email: barangay@example.com\n🌐 Facebook: @BarangayOfficial\n\nYou can also visit us at the Barangay Hall during office hours.",
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
        "Garbage Collection Schedule:\n🗑️ Biodegradable: Monday, Wednesday, Friday\n🗑️ Non-biodegradable: Tuesday, Thursday\n🗑️ Recyclables: Saturday\n\nCollection time: 6:00 AM - 10:00 AM\nPlease segregate your waste properly!",
    },
    vaccination: {
      keywords: ["vaccine", "vaccination", "bakuna", "covid", "immunization"],
      response:
        "Vaccination Services:\n💉 Location: Barangay Health Center\n💉 Schedule: Every Tuesday & Thursday, 9AM-3PM\n💉 Required: Valid ID and health card\n\nServices include COVID-19 vaccines, flu shots, and routine immunizations for children.",
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
        "To file a Barangay Blotter:\n1. Visit the Barangay Hall\n2. Go to the Lupon/Peacekeeping Office\n3. Present valid IDs of involved parties\n4. Describe the incident to the Barangay official\n\nMediation sessions are scheduled within 3-5 days. Bring any evidence or witnesses.",
    },
    indigency: {
      keywords: ["indigency", "financial", "assistance", "ayuda", "tulong"],
      response:
        "Certificate of Indigency:\nRequired for: Medical assistance, scholarship applications, legal aid\n\nRequirements:\n1. Accomplished application form\n2. Valid ID\n3. Proof of residence\n4. Supporting documents (medical records, bills, etc.)\n\nProcessing: 1-2 business days. No fee required.",
    },
    id: {
      keywords: ["barangay id", "id", "identification", "card"],
      response:
        "Barangay ID Application:\n📋 Requirements:\n- 2 pcs 1x1 photo\n- Birth certificate\n- Proof of residency\n- Fee: ₱30\n\nProcessing: 7-10 business days\nValid for: 3 years\n\nVisit the ID section during office hours.",
    },
    thanks: {
      keywords: ["thank", "thanks", "salamat", "thank you"],
      response:
        "You're welcome! If you have any other questions about Barangay services, feel free to ask. Have a great day! 😊",
    },
  };

  const quickQuestions = [
    "How to report an incident?",
    "Barangay clearance requirements",
    "Office hours",
    "Contact information",
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();

    // Check each FAQ category
    for (const category in faqDatabase) {
      const faq = faqDatabase[category];
      const hasKeyword = faq.keywords.some((keyword) =>
        lowerQuestion.includes(keyword.toLowerCase()),
      );

      if (hasKeyword) {
        return faq.response;
      }
    }

    // Default response if no match found
    return "I'm not sure about that. Here are some topics I can help with:\n\n• Incident Reporting\n• Barangay Clearance\n• Business Permits\n• Office Hours\n• Garbage Collection\n• Vaccination Services\n• Barangay Blotter\n• Certificate of Indigency\n• Barangay ID\n\nPlease rephrase your question or contact our office directly at 0917-XXX-XXXX.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      type: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = findAnswer(inputValue);
      const botMessage = {
        type: "bot",
        text: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 ${t.primaryGrad} bg-gradient-to-r text-white p-3 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group animate-bounce`}
          aria-label="Open FAQ Chatbot"
        >
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 z-40 ${t.cardBg} rounded-2xl shadow-2xl border ${t.cardBorder} flex flex-col animate-slideUp`}
          style={{ maxHeight: "calc(100vh - 2rem)", height: "600px" }}
        >
          {/* Header */}
          <div
            className={`bg-gradient-to-r ${t.primaryGrad} px-4 sm:px-5 py-3 sm:py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base font-spartan">
                  E-Kap
                </h3>
                <p className="text-white/80 text-xs font-kumbh">
                  Always here to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[75%] ${
                    message.type === "user"
                      ? `bg-gradient-to-r ${t.primaryGrad} text-white`
                      : `${isDark ? "bg-slate-800" : "bg-white"} ${t.cardText}`
                  } rounded-2xl px-4 py-2.5 shadow-md`}
                >
                  <p className="text-sm font-kumbh whitespace-pre-line break-words">
                    {message.text}
                  </p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.type === "user"
                        ? "text-white/70"
                        : `${t.subtleText}`
                    }`}
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
                  className={`${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl px-4 py-3 shadow-md`}
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

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className={`px-4 py-3 border-t ${t.cardBorder} flex-shrink-0`}>
              <p className={`text-xs ${t.subtleText} mb-2 font-kumbh`}>
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className={`text-xs px-3 py-1.5 ${isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200"} ${t.cardText} rounded-full transition-colors font-kumbh`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className={`p-3 sm:p-4 border-t ${t.cardBorder} flex-shrink-0`}>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className={`flex-1 px-4 py-2.5 sm:py-3 border rounded-xl ${t.inputBg} ${t.inputText} ${t.inputBorder} focus:ring-2 ${t.primaryRing} ${t.primaryBorder} transition-all text-sm font-kumbh`}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={`p-2.5 sm:p-3 bg-gradient-to-r ${t.primaryGrad} text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
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

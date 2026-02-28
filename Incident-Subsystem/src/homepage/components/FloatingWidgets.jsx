import { ArrowUp, MessageSquare, Send, X } from "lucide-react";

export default function FloatingWidgets({
  isDarkMode,
  isChatOpen,
  onToggleChat,
  onCloseChat,
  chatHistory,
  chatMessage,
  onChatMessageChange,
  onSendMessage,
  showBackToTop,
  onBackToTop,
}) {
  return (
    <>
      <div className="fixed bottom-6 left-4 md:bottom-10 md:left-10 z-[150] flex flex-col gap-4">
        <div className="relative">
          {isChatOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 md:hidden z-[199]"
                onClick={onCloseChat}
              />

              <div
                className={`
                  fixed md:absolute md:bottom-20 md:left-0 z-[200]
                  inset-4 md:inset-auto
                  md:w-[380px] md:h-[500px]
                  rounded-[24px] md:rounded-[40px] shadow-2xl overflow-hidden
                  flex flex-col border backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300
                  ${isDarkMode ? "bg-slate-900/95 border-white/10" : "bg-white/95 border-black/5"}
                  h-[calc(100%-2rem)]
                `}
              >
                <div className="p-4 md:p-6 bg-emerald-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <div>
                      <span className="font-black uppercase text-[10px] md:text-[11px] tracking-widest">
                        Barangay Gulod Assistant
                      </span>
                      <p className="text-[8px] md:text-[9px] text-emerald-300"></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close chat"
                    onClick={onCloseChat}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <X size={20} className="md:size-[22px]" />
                  </button>
                </div>

                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 text-[11px] md:text-xs custom-scrollbar">
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[85%] p-3 md:p-4 rounded-2xl font-medium
                          ${
                            msg.role === "user"
                              ? "bg-emerald-600 text-white rounded-br-none"
                              : isDarkMode
                                ? "bg-slate-800 text-slate-200 rounded-bl-none"
                                : "bg-slate-100 text-slate-800 rounded-bl-none"
                          }
                        `}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={onSendMessage} className="p-4 md:p-5 border-t border-white/10">
                  <div className="relative">
                    <input
                      value={chatMessage}
                      onChange={(e) => onChatMessageChange(e.target.value)}
                      type="text"
                      placeholder="Type your message..."
                      className={`
                        w-full py-3 md:py-4 pl-4 pr-12 rounded-xl text-[11px] md:text-xs
                        outline-none transition-all
                        ${
                          isDarkMode
                            ? "bg-slate-800 text-white placeholder:text-slate-500"
                            : "bg-slate-100 text-slate-900 placeholder:text-slate-400"
                        }
                      `}
                    />
                    <button
                      type="submit"
                      className={`
                        absolute right-2 top-2 p-2 rounded-lg transition-all
                        ${
                          chatMessage.trim()
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            : "bg-slate-300 text-slate-500 cursor-not-allowed"
                        }
                      `}
                      disabled={!chatMessage.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          <button
            type="button"
            aria-label={isChatOpen ? "Close digital assistant" : "Open digital assistant"}
            onClick={onToggleChat}
            className={`
              relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full
              shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95
              ${isChatOpen ? "bg-slate-800 rotate-90" : "bg-emerald-700 hover:bg-emerald-600"}
            `}
          >
            {isChatOpen ? (
              <X size={22} className="text-white" />
            ) : (
              <div className="relative">
                <MessageSquare size={22} className="text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-emerald-700 rounded-full animate-pulse" />
              </div>
            )}
          </button>
        </div>
      </div>

      {showBackToTop && (
        <button
          type="button"
          aria-label="Back to top"
          onClick={onBackToTop}
          className="fixed bottom-6 right-4 md:bottom-10 md:right-10 z-[150] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-emerald-700/20 backdrop-blur-md text-emerald-600 border border-emerald-600/20 rounded-full shadow-2xl hover:bg-emerald-700 hover:text-white transition-all animate-in fade-in zoom-in"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </>
  );
}

  import React, { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import {
    Sun,
    Moon,
    Loader2,
    CheckCircle2,
    Download,
    ArrowLeft,
    Search,
    Info,
  } from "lucide-react";
  import LoginForm from "./auth/login/LogInForm";
  import SignupForm from "./auth/signup/SignUpForm";
  import { useAuthLogic } from "./auth/hooks/useAuthLogic";
  import { useUser } from "../context/UserContext";
  import { handleDownloadSlip } from "../utils/sub-system-1/documentGenerator";
  import bsbPic from "../assets/images/bgygulod.png";
  import bgyLogo from "../assets/images/bgylogo.png";

  export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();
    const { updateUser } = useUser();

    const {
      formData,
      handleChange,
      submitAuth,
      loading,
      authSuccess,
      setAuthSuccess,
      trackingNum,
      handleTrackSearch,
      searchResult,
      purokList,
      allStreets,
      addressExists, 
      handleHouseNumberChange
    } = useAuthLogic(navigate, updateUser);

    const panelClass = isDarkMode
      ? "bg-slate-900/95 border-white/10 text-white"
      : "bg-white border-black/20 text-slate-900";
    const sideClass = isDarkMode ? "bg-slate-950/40 border-white/10" : "bg-slate-100/95 border-black/20";
    const mutedClass = isDarkMode ? "text-slate-400" : "text-slate-500";
    const strongMutedClass = isDarkMode ? "text-slate-300" : "text-slate-700";

    return (
      <div className={`min-h-screen w-screen relative overflow-x-hidden ${isDarkMode ? "bg-slate-950" : "bg-slate-100"}`}>
        <div className="fixed inset-0 z-0">
          <img
            src={bsbPic}
            alt="Barangay Hall"
            className={`w-full h-full object-cover ${isDarkMode ? "opacity-20 grayscale" : "opacity-38"}`}
          />
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? "bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950/95"
                : "bg-gradient-to-b from-white/60 via-white/38 to-white/65"
            }`}
          />
        </div>

        {authSuccess && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div
              className={`w-full max-w-md p-8 rounded-[36px] border shadow-2xl ${
                isDarkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-black/10 text-slate-900"
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-emerald-500" size={42} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-center mb-2">{authSuccess.title}</h2>
              <p className={`text-[11px] font-bold uppercase tracking-wider text-center mb-6 ${mutedClass}`}>
                {authSuccess.msg}
              </p>

              <div
                className={`rounded-3xl p-6 mb-6 border-2 border-dashed ${
                  isDarkMode ? "bg-slate-950/70 border-emerald-500/40" : "bg-slate-50 border-emerald-500/40"
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest text-center mb-2 ${mutedClass}`}>
                  Tracking Number
                </p>
                <p className="text-3xl font-black text-emerald-500 tracking-tight text-center">{authSuccess.code}</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    const fullName =
                      authSuccess.resident?.name ||
                      `${formData.firstName} ${formData.middleName || ""} ${formData.lastName} ${formData.suffix || ""}`
                        .replace(/\s+/g, " ")
                        .trim();

                    const pdfData = {
                      name: fullName.toUpperCase(),
                      trackingNumber: authSuccess.code,
                      status: authSuccess.resident?.status || "Pending",
                      submittedDate:
                        authSuccess.resident?.submittedDate ||
                        new Date().toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }),
                    };

                    handleDownloadSlip(pdfData);
                  }}
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Download size={16} /> Download Registration Slip
                </button>
                <button
                  onClick={() => {
                    setAuthSuccess(null);
                    setIsSignup(false);
                  }}
                  className={`w-full py-2 font-black uppercase text-[10px] tracking-widest transition-colors ${mutedClass} ${
                    isDarkMode ? "hover:text-slate-200" : "hover:text-slate-700"
                  }`}
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="relative z-20 pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6">
          <div className="w-full flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-colors ${
                isDarkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-black/5 text-slate-900"
              }`}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDarkMode ? "border-white/10 bg-slate-900/70" : "border-black/10 bg-white/80"
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-emerald-800" />
              )}
            </button>
          </div>

          <div className={`mx-auto w-full ${isSignup ? "max-w-6xl" : "max-w-5xl"}`}>

            {!isSignup ? (
              <div
                className={`rounded-[28px] sm:rounded-[40px] border shadow-2xl overflow-hidden backdrop-blur-2xl max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-8rem)] overflow-y-auto custom-scrollbar ${panelClass}`}
              >
                <div className="grid lg:grid-cols-[360px_1fr]">
                  <aside className={`p-5 sm:p-8 lg:p-8 border-b lg:border-b-0 lg:border-r flex flex-col ${sideClass}`}>
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.28em] mb-6 ${
                        isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <Info size={12} /> District 5, Quezon City
                    </div>

                    <div className="mb-5 flex flex-col items-center text-center">
                      <div
                        className={`mb-3 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-emerald-500/20 ${
                          isDarkMode ? "bg-white/95" : "bg-white"
                        } shadow-sm`}
                      >
                        <img src={bgyLogo} alt="Barangay Gulod Logo" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black uppercase leading-[0.95] tracking-tight text-emerald-600">
                        Barangay
                        <br />
                        Gulod
                        <br />
                        Novaliches
                      </h2>
                      <div className="mt-2.5 w-12 h-1 rounded-full bg-emerald-500" />
                    </div>

                    <div
                      className={`rounded-[28px] p-5 border mt-6 lg:mt-auto ${
                        isDarkMode ? "bg-slate-950/70 border-white/10" : "bg-white/90 border-black/20"
                      }`}
                    >
                      <label className={`text-[10px] font-black uppercase tracking-[0.25em] mb-3 block ${mutedClass}`}>
                        Track Application
                      </label>
                      <div className="relative">
                        <Search size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${mutedClass}`} />
                        <input
                          type="text"
                          value={trackingNum}
                          onChange={(e) => handleTrackSearch(e.target.value)}
                          placeholder="BGN-XXXX"
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 text-xs font-black uppercase tracking-widest outline-none transition-colors bg-transparent focus:border-emerald-500 ${
                            isDarkMode ? "border-slate-300/30" : "border-slate-400/70"
                          }`}
                        />
                      </div>

                      {searchResult && (
                        <div
                          className={`mt-4 rounded-2xl p-4 border ${
                            isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-slate-50 border-black/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Status</p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                searchResult.status === "Verified"
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : searchResult.status === "Rejected"
                                    ? "bg-rose-100 text-rose-700 border-rose-200"
                                    : searchResult.status === "For Verification"
                                      ? "bg-blue-100 text-blue-700 border-blue-200"
                                      : "bg-amber-100 text-amber-700 border-amber-200"
                              }`}
                            >
                              {searchResult.status}
                            </span>
                          </div>
                          <p className={`text-sm font-black leading-tight mb-1 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                            {searchResult.message}
                          </p>
                          {searchResult.name && (
                            <p className={`text-[10px] font-medium italic ${mutedClass}`}>Applicant: {searchResult.name}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </aside>

                  <section className="p-5 sm:p-8 lg:p-8">
                    <div className="max-w-xl">
                      <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none mb-3">Sign In</h1>
                      <p className={`text-sm leading-relaxed mb-6 ${strongMutedClass}`}>
                        Use your resident credentials to access your account.
                      </p>

                      <form
                        id="auth-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitAuth(false);
                        }}
                        className="space-y-6"
                      >
                        <LoginForm formData={formData} handleChange={handleChange} isDarkMode={isDarkMode} />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <label className={`inline-flex items-center gap-2 text-xs font-bold ${strongMutedClass}`}>
                            <input type="checkbox" className="accent-emerald-600 w-4 h-4" />
                            Remember me
                          </label>
                          <button type="button" className="text-xs font-black uppercase tracking-wide text-emerald-600 hover:text-emerald-500">
                            Forgot password?
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full sm:w-auto sm:min-w-[280px] py-4 px-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto !mt-10"
                        >
                          {loading ? <Loader2 className="animate-spin" size={20} /> : "Login Portal"}
                        </button>
                      </form>

                      <div className={`mt-8 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 ${mutedClass}`}>
                        <span>No account yet?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignup(true);
                            setAuthSuccess(null);
                          }}
                          className="text-emerald-600 hover:text-emerald-500 transition-colors font-black uppercase tracking-[0.05em]"
                        >
                          Register here!
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-[28px] sm:rounded-[40px] border shadow-2xl overflow-y-auto lg:overflow-hidden backdrop-blur-2xl max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-8rem)] custom-scrollbar ${panelClass}`}
              >
                <div className="grid lg:grid-cols-[360px_1fr] lg:h-full">
                  <aside className={`p-5 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r ${sideClass}`}>
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.28em] mb-8 ${
                        isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <Info size={12} /> District 5, Quezon City
                    </div>

                    <div className="mb-5 flex flex-col items-center text-center">
                      <div
                        className={`mb-3 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-emerald-500/20 ${
                          isDarkMode ? "bg-white/95" : "bg-white"
                        } shadow-sm`}
                      >
                        <img src={bgyLogo} alt="Barangay Gulod Logo" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black uppercase leading-[0.95] tracking-tight text-emerald-600">
                        Barangay
                        <br />
                        Gulod
                        <br />
                        Novaliches
                      </h2>
                      <div className="mt-2.5 w-12 h-1 rounded-full bg-emerald-500" />
                    </div>
                  </aside>

                  <section className="p-5 sm:p-8 lg:p-10 lg:min-h-0">
                    <div className="max-w-3xl lg:h-full flex flex-col lg:min-h-0">
                      <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none mb-4">Register</h1>
                      <p className={`text-sm leading-relaxed mb-5 ${strongMutedClass}`}>
                        Fill in accurate details so your account can be approved faster.
                      </p>

                      <div
                        className={`rounded-[30px] border p-4 sm:p-6 lg:p-8 lg:flex-[1.35] lg:min-h-0 overflow-visible lg:overflow-hidden ${
                          isDarkMode ? "bg-slate-950/40 border-white/10" : "bg-white/90 border-black/20"
                        }`}
                      >
                        <div className="max-h-none lg:h-full lg:min-h-0 overflow-visible lg:overflow-y-auto custom-scrollbar lg:-mr-8 lg:pr-8">
                          <form
                            id="auth-form"
                            onSubmit={(e) => {
                              e.preventDefault();
                            }}
                            className="pt-1"
                          >
                            <SignupForm
                              formData={formData}
                              handleChange={handleChange}
                              isDarkMode={isDarkMode}
                              handleSubmit={() => submitAuth(true)}
                              loading={loading}
                              purokList={purokList}
                              allStreets={allStreets}
                              addressExists={addressExists}
                              handleHouseNumberChange={handleHouseNumberChange}
                            />
                          </form>
                        </div>
                      </div>

                      {/* SYNCED FOOTER FOR SIGNUP PAGE */}
                      <div className={`mt-6 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center text-center flex-wrap gap-1.5 ${mutedClass}`}>
                        <span>Already have an account?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignup(false);
                            setAuthSuccess(null);
                          }}
                          className="text-emerald-600 hover:text-emerald-500 transition-colors font-black uppercase tracking-[0.05em]"
                        >
                          Log in here!
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        </main>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          .full-input-sm {
            width: 100%;
            padding: 0.95rem 1rem;
            border: 2px solid ${isDarkMode ? "rgba(148,163,184,0.22)" : "rgba(15,23,42,0.25)"};
            border-radius: 16px;
            background: ${isDarkMode ? "rgba(2,6,23,0.7)" : "rgba(255,255,255,0.95)"};
            color: ${isDarkMode ? "#f8fafc" : "#0f172a"};
            outline: none;
            transition: border-color .2s ease, box-shadow .2s ease;
            font-size: 0.82rem;
            font-weight: 800;
            letter-spacing: .01em;
            text-transform: none;
          }
          .full-input-sm:focus {
            border-color: #059669;
            box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.12);
          }
          .signin-input {
            width: 100%;
            padding: 1rem 1.05rem;
            border: 2px solid ${isDarkMode ? "rgba(148,163,184,0.22)" : "rgba(15,23,42,0.25)"};
            border-radius: 16px;
            background: ${isDarkMode ? "rgba(2,6,23,0.72)" : "rgba(255,255,255,0.98)"};
            color: ${isDarkMode ? "#f8fafc" : "#0f172a"};
            outline: none;
            transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
            font-size: 0.93rem;
            font-weight: 700;
            letter-spacing: .01em;
          }
          .signin-input::placeholder {
            color: ${isDarkMode ? "rgba(148,163,184,0.75)" : "rgba(100,116,139,0.95)"};
            font-weight: 600;
          }
          .signin-input:focus {
            border-color: #059669;
            box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.12);
            background: ${isDarkMode ? "rgba(2,6,23,0.9)" : "rgba(255,255,255,1)"};
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #10b981 rgba(148,163,184,0.22);
            scrollbar-gutter: stable;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-button {
            display: none;
            height: 0;
            width: 0;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(148,163,184,0.22);
            margin-block: 8px;
            border-radius: 999px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #10b981;
            min-height: 72px;
            border-radius: 999px;
          }
        `,
          }}
        />
      </div>
    );
  }



/**
 * Step4Upload.jsx
 * FIXED: Data Privacy Agreement is now a modal popup.
 *   - Checkbox is LOCKED until user scrolls to the very bottom of the policy.
 *   - A progress indicator shows how far they've scrolled.
 *   - Once fully scrolled, checkbox unlocks and they can agree.
 *   - "Read Policy" button opens the modal; agreed state persists.
 * All original upload logic, validation, and flow preserved.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Image as ImageIcon,
  ShieldCheck,
  Lock,
  Unlock,
  X,
  ChevronDown,
  CheckCircle2,
  FileText,
  Camera,
} from "lucide-react";

// ── Policy Section sub-component ─────────────────────────────────────────────
const PolicySection = ({ number, title, children, isDarkMode }) => (
  <div>
    <p className={`text-[11px] font-black uppercase tracking-wider mb-1.5 font-kumbh ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
      <span className="text-emerald-500 mr-1">{number}.</span>{title}
    </p>
    <p className={`text-[11px] leading-relaxed font-kumbh ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
      {children}
    </p>
  </div>
);

// ── Privacy Policy Modal ──────────────────────────────────────────────────────
const PrivacyPolicyModal = ({ isOpen, onClose, onAgree, alreadyAgreed, isDarkMode }) => {
  const scrollRef        = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);  // 0–100
  const [hasReachedEnd,  setHasReachedEnd]   = useState(alreadyAgreed);
  const [agreed,         setAgreed]          = useState(alreadyAgreed);

  // Reset scroll state each time modal opens (unless already agreed)
  useEffect(() => {
    if (isOpen && !alreadyAgreed) {
      setScrollProgress(0);
      setHasReachedEnd(false);
      setAgreed(false);
      // Scroll the content back to top
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
    if (isOpen && alreadyAgreed) {
      setScrollProgress(100);
      setHasReachedEnd(true);
      setAgreed(true);
    }
  }, [isOpen, alreadyAgreed]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const scrollable = scrollHeight - clientHeight;
    if (scrollable <= 0) { setScrollProgress(100); setHasReachedEnd(true); return; }
    const progress = Math.round((scrollTop / scrollable) * 100);
    setScrollProgress(progress);
    // Unlock at 95% so it feels natural even if they don't hit exact bottom
    if (progress >= 95) setHasReachedEnd(true);
  }, []);

  const handleConfirm = () => {
    if (!agreed) return;
    onAgree();
    onClose();
  };

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-lg flex flex-col rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200 ${
        isDarkMode ? "bg-slate-900 border border-slate-700" : "bg-white border border-slate-200"
      }`}>

        {/* ── HEADER ── */}
        <div className={`flex items-center gap-3 px-6 py-4 border-b flex-shrink-0 ${
          isDarkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50"
        }`}>
          <div className="p-2 rounded-xl bg-emerald-600">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-black uppercase tracking-widest font-kumbh ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
              Data Privacy &amp; Consent Agreement
            </p>
            <p className={`text-[9px] font-bold mt-0.5 font-kumbh ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
              R.A. 10173 — Data Privacy Act of 2012
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${isDarkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── SCROLL PROGRESS BAR ── */}
        <div className={`h-1 w-full flex-shrink-0 ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}>
          <div
            className="h-full bg-emerald-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* ── SCROLL HINT (shown while not reached end) ── */}
        {!hasReachedEnd && (
          <div className={`flex items-center justify-center gap-2 py-2 flex-shrink-0 ${
            isDarkMode ? "bg-amber-900/20 border-b border-amber-800/30" : "bg-amber-50 border-b border-amber-100"
          }`}>
            <ChevronDown size={13} className="text-amber-500 animate-bounce" />
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 font-kumbh">
              Please scroll to the bottom to read the full policy
            </p>
            <ChevronDown size={13} className="text-amber-500 animate-bounce" />
          </div>
        )}

        {/* ── POLICY CONTENT (scrollable) ── */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto px-6 py-5 space-y-5 ${
            isDarkMode ? "scrollbar-dark" : ""
          }`}
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Intro */}
          <p className={`text-[11px] leading-relaxed font-medium font-kumbh ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            Before submitting your registration, please read the following Data Privacy Notice carefully.
            Barangay Gulod, Novaliches, Quezon City is committed to protecting your personal information
            in accordance with the <strong>Data Privacy Act of 2012 (R.A. 10173)</strong>.
          </p>

          <PolicySection number="1" title="Data Controller" isDarkMode={isDarkMode}>
            Barangay Gulod, Novaliches, Quezon City ("the Barangay") acts as the Personal Information
            Controller under R.A. 10173 and its Implementing Rules and Regulations (IRR).
          </PolicySection>

          <PolicySection number="2" title="Data Collected" isDarkMode={isDarkMode}>
            The Barangay collects your full name, date of birth, gender, civil status, contact
            information, residential address, employment details, educational background, household
            composition, and government-issued identification documents (front and back photos).
          </PolicySection>

          <PolicySection number="3" title="Purpose of Processing" isDarkMode={isDarkMode}>
            Your personal data is collected exclusively for: (a) Barangay Resident Registration and
            Official Record-Keeping; (b) Household Survey and Socio-Economic Profiling; (c) Delivery
            of Barangay Services, Programs, and Benefits; and (d) Compliance with National Government
            Reporting Requirements (PSA, DILG, and other agencies).
          </PolicySection>

          <PolicySection number="4" title="Lawful Basis" isDarkMode={isDarkMode}>
            Processing is conducted under a lawful basis pursuant to Section 12(b) and 12(c) of
            R.A. 10173 — as it is necessary for the performance of a function of public authority
            vested in the Barangay, and for compliance with a legal obligation.
          </PolicySection>

          <PolicySection number="5" title="Data Sharing &amp; Disclosure" isDarkMode={isDarkMode}>
            Your data will not be sold, leased, or disclosed to third parties except: (a) national
            government agencies with lawful authority; (b) agencies requiring statistical data in
            anonymized or aggregated form; or (c) as required by court order or applicable Philippine law.
            The Barangay does not engage in cross-border data transfers.
          </PolicySection>

          <PolicySection number="6" title="Data Retention" isDarkMode={isDarkMode}>
            Personal records shall be retained for the period required under applicable laws and
            Barangay records management policies. After the retention period lapses, records will be
            securely disposed of in accordance with the National Archives Act and NPC guidelines.
          </PolicySection>

          <PolicySection number="7" title="Your Rights as a Data Subject" isDarkMode={isDarkMode}>
            Under R.A. 10173, you are entitled to: (1) Right to be Informed; (2) Right to Access;
            (3) Right to Rectification; (4) Right to Erasure or Blocking; (5) Right to Object;
            (6) Right to Data Portability; (7) Right to Lodge a Complaint before the National
            Privacy Commission (NPC) at complaints@privacy.gov.ph.
          </PolicySection>

          <PolicySection number="8" title="Security Measures" isDarkMode={isDarkMode}>
            The Barangay implements appropriate organizational, physical, and technical security
            measures to protect your personal data against unauthorized access, alteration,
            disclosure, or destruction — including access controls, encrypted storage, and
            regular security assessments.
          </PolicySection>

          <PolicySection number="9" title="Automated Decision-Making" isDarkMode={isDarkMode}>
            Your registration data is not subject to automated decision-making or profiling that
            produces legal effects or similarly significant impacts without human review by
            authorized Barangay personnel.
          </PolicySection>

          <PolicySection number="10" title="Contact &amp; Complaints" isDarkMode={isDarkMode}>
            For privacy-related concerns, inquiries, or to exercise your data subject rights,
            please contact the Barangay Secretary at Barangay Hall, Gulod, Novaliches, Quezon City.
            You may also file a complaint directly with the National Privacy Commission (NPC)
            at www.privacy.gov.ph.
          </PolicySection>

          {/* Bottom sentinel — reached-end indicator */}
          <div className={`flex items-center gap-2 pt-2 pb-1 ${
            isDarkMode ? "text-slate-500 border-t border-slate-800" : "text-slate-400 border-t border-slate-100"
          }`}>
            <FileText size={10} />
            <span className="text-[9px] font-bold uppercase tracking-wider font-kumbh">
              End of Data Privacy Notice — effective as of the date of your submission.
            </span>
          </div>
        </div>

        {/* ── CONSENT FOOTER ── */}
        <div className={`px-6 py-4 border-t flex-shrink-0 space-y-4 ${
          isDarkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50"
        }`}>

          {/* Checkbox — locked until scrolled */}
          <label className={`flex items-start gap-3 ${hasReachedEnd ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
            <div className="mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                disabled={!hasReachedEnd}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-5 w-5 rounded border-2 border-slate-300 dark:border-slate-600 cursor-pointer accent-emerald-600 disabled:cursor-not-allowed"
              />
            </div>
            <p className={`text-[11px] font-bold leading-relaxed font-kumbh ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
              I have read and understood the Data Privacy Notice. I freely and voluntarily give my
              consent to Barangay Gulod to collect, process, and store my personal information for
              the stated purposes in compliance with R.A. 10173.
            </p>
          </label>

          {/* Lock hint */}
          {!hasReachedEnd && (
            <div className="flex items-center gap-2">
              <Lock size={11} className="text-amber-500 flex-shrink-0" />
              <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-kumbh">
                Scroll to the bottom to unlock the consent checkbox
              </p>
            </div>
          )}

          {/* Confirm button */}
          <button
            type="button"
            disabled={!agreed}
            onClick={handleConfirm}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest font-kumbh transition-all ${
              agreed
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            {agreed ? "I Agree & Continue" : "Read the Full Policy Above"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const TermsAndConditionModal = ({ isOpen, onClose, onAgree, alreadyAgreed, isDarkMode }) => {
  const [agreed, setAgreed] = useState(alreadyAgreed);

  useEffect(() => {
    if (isOpen) setAgreed(alreadyAgreed);
  }, [isOpen, alreadyAgreed]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    if (!agreed) return;
    onAgree();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full max-w-lg flex flex-col rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] ${
        isDarkMode ? "bg-slate-900 border border-slate-700" : "bg-white border border-slate-200"
      }`}>
        <div className={`flex items-center gap-3 px-6 py-4 border-b ${
          isDarkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50"
        }`}>
          <div className="p-2 rounded-xl bg-emerald-600">
            <FileText size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-black uppercase tracking-widest font-kumbh ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
              Terms and Condition
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${isDarkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <X size={16} />
          </button>
        </div>

        <div className={`px-6 py-5 space-y-4 text-[11px] leading-relaxed overflow-y-auto font-kumbh ${
          isDarkMode ? "text-slate-300" : "text-slate-600"
        }`}>
          <p>
            By continuing your registration, you confirm that all information and uploaded documents are true,
            complete, and belong to you.
          </p>
          <p>
            False declarations, misuse of this portal, or submission of invalid requirements may result in
            delayed processing, denial of application, or legal action.
          </p>
          <p>
            Barangay Gulod may verify submitted details and supporting records in accordance with applicable
            Philippine laws and local government procedures.
          </p>
        </div>

        <div className={`px-6 py-4 border-t space-y-4 ${
          isDarkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50"
        }`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-5 w-5 rounded border-2 border-slate-300 dark:border-slate-600 cursor-pointer accent-emerald-600"
              />
            </div>
            <p className={`text-[11px] font-bold leading-relaxed font-kumbh ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
              I have read and understood the Terms and Condition.
            </p>
          </label>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!agreed}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest font-kumbh transition-all ${
              agreed
                ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            {agreed ? "I Agree & Continue" : "Read and Confirm Above"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Step4Upload ───────────────────────────────────────────────────────────────
const CameraCaptureModal = ({
  isOpen,
  onClose,
  onCapture,
  side,
  isDarkMode,
  onFallbackCapture,
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCameraError("");
      setIsCapturing(false);
      return undefined;
    }

    let cancelled = false;

    const startCamera = async () => {
      const isSecure =
        typeof window !== "undefined" &&
        (window.isSecureContext ||
          ["localhost", "127.0.0.1"].includes(window.location?.hostname));

      if (!isSecure) {
        setCameraError("Camera access requires HTTPS or localhost.");
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("This device or browser does not support camera access.");
        return;
      }

      setIsStarting(true);
      setCameraError("");

      try {
        let stream = null;
        const constraintsList = [
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          { video: true, audio: false },
        ];

        for (const constraints of constraintsList) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (error) {
            stream = null;
          }
        }

        if (!stream) {
          throw new Error("Unable to access the device camera.");
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        setCameraError(
          error?.name === "NotAllowedError"
            ? "Camera permission was blocked. Allow access and try again."
            : "Unable to start the camera on this device.",
        );
      } finally {
        if (!cancelled) {
          setIsStarting(false);
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  const handleTakePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    setIsCapturing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not available.");

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) {
        throw new Error("Failed to capture image.");
      }

      const safeSide = side === "front" ? "front" : "back";
      const file = new File([blob], `barangay-id-${safeSide}-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      onCapture(file);
      onClose();
    } catch (error) {
      setCameraError("Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-2xl overflow-hidden rounded-[2rem] border shadow-2xl ${
          isDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isDarkMode ? "border-slate-700 bg-slate-800/70" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2">
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-widest font-kumbh ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                Use Camera
              </p>
              <p className={`text-[10px] font-bold font-kumbh ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Capture the {side} side of your ID
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl p-2 transition-colors ${
              isDarkMode ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div
            className={`relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border ${
              isDarkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-slate-100"
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {(isStarting || cameraError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/75 px-6 text-center">
                {isStarting && !cameraError && (
                  <>
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                    <p className="text-sm font-bold text-white font-kumbh">Starting camera...</p>
                  </>
                )}
                {cameraError && (
                  <>
                    <p className="text-sm font-bold text-white font-kumbh">{cameraError}</p>
                    <p className="text-xs text-slate-300 font-kumbh">
                      If camera access is unavailable here, use `UPLOAD PHOTO` as fallback.
                    </p>
                    {onFallbackCapture && (
                      <button
                        type="button"
                        onClick={onFallbackCapture}
                        className="mt-1 rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 font-kumbh"
                      >
                        Use Native Camera
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className={`text-[11px] font-bold font-kumbh ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Position the ID clearly inside the frame before taking the photo.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-wider font-kumbh ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={isStarting || !!cameraError || isCapturing}
                className={`rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white font-kumbh ${
                  isStarting || cameraError || isCapturing
                    ? "cursor-not-allowed bg-emerald-400"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isCapturing ? "Capturing..." : "Take Photo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Step4Upload = ({
  formData,
  handleChange,
  isDarkMode,
  setStep,
  previews,
  handleFile,
  handleCapturedFile,
  onReviewSubmit,
  loading = false,
}) => {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [privacyAgreed,    setPrivacyAgreed]    = useState(false);
  const [termsModalOpen,   setTermsModalOpen]   = useState(false);
  const [termsAgreed,      setTermsAgreed]      = useState(false);
  const galleryInputRefs = useRef({});
  const [cameraTarget, setCameraTarget] = useState(null);

  const labelClass = `text-[11px] font-black uppercase tracking-widest font-kumbh ${isDarkMode ? "text-slate-400" : "text-slate-500"}`;

  const hasFront = !!previews?.front;
  const hasBack  = !!previews?.back;

  const contactStr     = formData.contact ? String(formData.contact).replace(/\D/g, "") : "";
  const isContactValid = contactStr.length === 11 && contactStr.startsWith("09");

  const isReady = hasFront && hasBack && isContactValid && privacyAgreed && termsAgreed && !loading;
  const canUseLiveCamera = () => {
    if (typeof window === "undefined") return false;
    const isSecure =
      window.isSecureContext ||
      ["localhost", "127.0.0.1"].includes(window.location?.hostname);
    return isSecure && !!navigator.mediaDevices?.getUserMedia;
  };

  const openNativeCamera = (fieldName) => {
    const targetInput = galleryInputRefs.current[fieldName];
    if (targetInput) {
      targetInput.value = "";
      targetInput.setAttribute("capture", "environment");
      targetInput.click();
    }
  };

  const openUploadPicker = (fieldName) => {
    const targetInput = galleryInputRefs.current[fieldName];
    if (targetInput) {
      targetInput.value = "";
      targetInput.removeAttribute("capture");
      targetInput.click();
    }
  };

  const openPicker = (fieldName, source) => {
    if (source === "camera") {
      if (!canUseLiveCamera()) {
        openNativeCamera(fieldName);
        return;
      }
      const side = fieldName === "idFront" ? "front" : "back";
      setCameraTarget({ fieldName, side });
      return;
    }

    openUploadPicker(fieldName);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        onAgree={() => setPrivacyAgreed(true)}
        alreadyAgreed={privacyAgreed}
        isDarkMode={isDarkMode}
      />
      <TermsAndConditionModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAgree={() => setTermsAgreed(true)}
        alreadyAgreed={termsAgreed}
        isDarkMode={isDarkMode}
      />

      {/* 1. DOCUMENT UPLOAD SECTION — unchanged from original */}
      <CameraCaptureModal
        isOpen={!!cameraTarget}
        onClose={() => setCameraTarget(null)}
        onCapture={(file) => {
          if (!cameraTarget) return;
          handleCapturedFile(file, cameraTarget.side);
        }}
        onFallbackCapture={() => {
          if (!cameraTarget) return;
          const fieldName = cameraTarget.fieldName;
          setCameraTarget(null);
          openNativeCamera(fieldName);
        }}
        side={cameraTarget?.side || "front"}
        isDarkMode={isDarkMode}
      />

      <section className="space-y-3">
        <header className="flex justify-between items-end px-1">
          <h3 className={labelClass}>Identification Documents</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
            hasFront && hasBack ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          }`}>
            <span className="font-kumbh">{hasFront && hasBack ? "✓ Requirements Met" : "Required: 2 Photos"}</span>
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["idFront", "idBack"].map((fieldName) => {
            const side     = fieldName === "idFront" ? "front" : "back";
            const hasImage = !!previews[side];

            return (
              <div key={fieldName} className="group relative">
                <div className={`
                  relative h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center
                  overflow-hidden transition-all duration-300
                  ${!hasImage
                    ? "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 hover:border-emerald-500"
                    : "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-500/5"}
                `}>
                  {previews[side] ? (
                    <>
                      <img src={previews[side]} className="w-full h-full object-cover" alt={`${side} view`} />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-3">
                        <button
                          type="button"
                          onClick={() => openPicker(fieldName, "upload")}
                          className="w-full max-w-[150px] text-white text-[10px] font-black uppercase tracking-widest font-kumbh bg-emerald-600 px-3 py-2 rounded-xl shadow-lg hover:bg-emerald-700"
                        >
                          Upload Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => openPicker(fieldName, "camera")}
                          className="w-full max-w-[150px] text-white text-[10px] font-black uppercase tracking-widest font-kumbh bg-slate-700 px-3 py-2 rounded-xl shadow-lg hover:bg-slate-800"
                        >
                          Use Camera
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2 px-3">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 shadow-sm rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                        <ImageIcon size={20} className={isDarkMode ? "text-emerald-500" : "text-emerald-600"} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest font-kumbh">
                          Upload {side} ID
                        </p>
                        <p className="text-[9px] text-slate-400 italic mt-0.5 font-bold font-kumbh">Max 5MB • JPG/PNG</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openPicker(fieldName, "upload")}
                          className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-kumbh"
                        >
                          Upload Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => openPicker(fieldName, "camera")}
                          className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 font-kumbh"
                        >
                          Use Camera
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    name={fieldName}
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleFile(e, side)}
                    ref={(el) => { galleryInputRefs.current[fieldName] = el; }}
                    className="hidden"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. DATA PRIVACY SECTION — trigger button + agreed state display */}
      <section>
        {!privacyAgreed ? (
          /* Not yet agreed — show open modal button */
          <button
            type="button"
            onClick={() => setPrivacyModalOpen(true)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.01] active:scale-[0.99] ${
              isDarkMode
                ? "border-slate-600 hover:border-emerald-500 bg-slate-800/40"
                : "border-slate-300 hover:border-emerald-500 bg-slate-50"
            }`}
          >
            <div className={`p-3 rounded-xl flex-shrink-0 ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`}>
              <Lock size={18} className={isDarkMode ? "text-slate-400" : "text-slate-500"} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className={`text-xs font-black uppercase tracking-wide font-kumbh ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                Data Privacy &amp; Consent Agreement
              </p>
              <p className={`text-[9px] font-bold mt-0.5 uppercase tracking-wider font-kumbh ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                Required — Tap to read and accept before submitting
              </p>
            </div>
            <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex-shrink-0 font-kumbh ${
              isDarkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-700"
            }`}>
              Open
            </div>
          </button>
        ) : (
          /* Already agreed — show confirmation badge with option to re-read */
          <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
            isDarkMode
              ? "border-emerald-700 bg-emerald-900/20"
              : "border-emerald-400 bg-emerald-50"
          }`}>
            <div className="p-3 rounded-xl bg-emerald-500 flex-shrink-0">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-black uppercase tracking-wide font-kumbh ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                Privacy Policy Accepted
              </p>
              <p className={`text-[9px] font-bold mt-0.5 font-kumbh ${isDarkMode ? "text-emerald-600" : "text-emerald-600"}`}>
                R.A. 10173 — Data Privacy Act of 2012
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPrivacyModalOpen(true)}
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex-shrink-0 transition-colors font-kumbh ${
                isDarkMode
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white text-slate-500 hover:text-slate-700 border border-slate-200"
              }`}
            >
              Re-read
            </button>
          </div>
        )}
      </section>

      {/* 3. TERMS AND CONDITION SECTION */}
      <section>
        {!termsAgreed ? (
          <button
            type="button"
            onClick={() => setTermsModalOpen(true)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.01] active:scale-[0.99] ${
              isDarkMode
                ? "border-slate-600 hover:border-emerald-500 bg-slate-800/40"
                : "border-slate-300 hover:border-emerald-500 bg-slate-50"
            }`}
          >
            <div className={`p-3 rounded-xl flex-shrink-0 ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`}>
              <FileText size={18} className={isDarkMode ? "text-slate-400" : "text-slate-500"} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className={`text-xs font-black uppercase tracking-wide font-kumbh ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                Terms and Condition
              </p>
              <p className={`text-[9px] font-bold mt-0.5 uppercase tracking-wider font-kumbh ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                Required - Tap to read before submitting
              </p>
            </div>
            <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex-shrink-0 font-kumbh ${
              isDarkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-700"
            }`}>
              Open
            </div>
          </button>
        ) : (
          <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
            isDarkMode
              ? "border-emerald-700 bg-emerald-900/20"
              : "border-emerald-400 bg-emerald-50"
          }`}>
            <div className="p-3 rounded-xl bg-emerald-500 flex-shrink-0">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-black uppercase tracking-wide font-kumbh ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                Terms and Condition Accepted
              </p>
              <p className={`text-[9px] font-bold mt-0.5 font-kumbh ${isDarkMode ? "text-emerald-600" : "text-emerald-600"}`}>
                You can review this anytime
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTermsModalOpen(true)}
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex-shrink-0 transition-colors font-kumbh ${
                isDarkMode
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white text-slate-500 hover:text-slate-700 border border-slate-200"
              }`}
            >
              Re-read
            </button>
          </div>
        )}
      </section>

      {/* 4. FINAL ACTIONS — unchanged from original */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => isReady && onReviewSubmit()}
          disabled={!isReady || loading}
          className={`
            w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] font-kumbh transition-all duration-300
            shadow-2xl active:scale-[0.97]
            ${isReady
              ? "bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-900/30"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"}
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">Processing...</span>
          ) : isReady ? (
            "Review My Application"
          ) : !isContactValid ? (
            "Check Contact Number (Step 1)"
          ) : !hasFront || !hasBack ? (
            "Upload Both ID Photos"
          ) : !termsAgreed ? (
            "Accept the Terms and Condition to Continue"
          ) : !privacyAgreed ? (
            "Accept the Privacy Agreement to Continue"
          ) : (
            "Check Missing Info"
          )}
        </button>

        <button
          type="button"
          onClick={() => setStep(3)}
          className="w-full py-3 font-black text-[10px] uppercase tracking-widest font-kumbh text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Step4Upload;

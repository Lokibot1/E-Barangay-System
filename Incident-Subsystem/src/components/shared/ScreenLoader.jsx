import React from "react";
import { createPortal } from "react-dom";

const ScreenLoader = ({
  show,
  title = "Loading",
  description = "Please wait...",
  zIndexClass = "z-[2000]",
}) => {
  if (!show || typeof document === "undefined") return null;

  return createPortal(
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4`}>
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/90 px-6 py-7 text-center text-white shadow-2xl">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-400" />
        <h3 className="font-spartan text-lg font-black uppercase tracking-wide">
          {title}
        </h3>
        <p className="mt-2 font-kumbh text-sm text-slate-300">
          {description}
        </p>
      </div>
    </div>,
    document.body
  );
};

export default ScreenLoader;

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  variant = "danger", // 'danger', 'warning', 'info'
  isLoading = false 
}) => {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isLoading) {
      setTimeout(() => confirmBtnRef.current?.focus(), 100);
    }
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  const variants = {
    danger: "bg-red-600 hover:bg-red-700 ring-red-500",
    warning: "bg-amber-500 hover:bg-amber-600 ring-amber-400",
    info: "bg-blue-600 hover:bg-blue-700 ring-blue-500"
  };

  const iconColors = {
    danger: "bg-red-100 text-red-600",
    warning: "bg-amber-100 text-amber-600",
    info: "bg-blue-100 text-blue-600"
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header & Close Button */}
        <div className="flex justify-end p-2">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${iconColors[variant]}`}>
            <AlertTriangle size={24} />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-2">
          <button
            ref={confirmBtnRef}
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full inline-flex justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
          <button
            disabled={isLoading}
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
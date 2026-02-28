import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  lockBodyScroll = true,
}) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    const previousOverflow = document.body.style.overflow;
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      if (lockBodyScroll) {
        document.body.style.overflow = 'hidden';
      }
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      if (lockBodyScroll) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [isOpen, onClose, lockBodyScroll]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - Blur effect */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Box */}
      <div className={`relative bg-white dark:bg-slate-900 w-full ${maxWidth} max-h-[90vh] overflow-hidden shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-200`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-600 dark:text-slate-400">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  lockBodyScroll = true,
  t,
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
      <div className={`relative ${t ? t.cardBg : 'bg-white'} w-full ${maxWidth} max-h-[90vh] overflow-hidden shadow-2xl rounded-2xl border ${t ? t.cardBorder : 'border-slate-200'} flex flex-col animate-in zoom-in-95 duration-200`}>

        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${t ? t.cardBorder : 'border-slate-200'}`}>
          <h3 className={`text-lg font-bold ${t ? t.cardText : 'text-slate-800'}`}>{title}</h3>
          <button onClick={onClose} className={`p-1.5 hover:${t ? t.inlineBg : 'bg-slate-100'} rounded-lg text-slate-500`}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 ${t ? t.subtleText : 'text-slate-600'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;

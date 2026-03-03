import React from 'react';

const ImageZoomOverlay = ({ isOpen, imgSrc, onClose }) => {
  if (!isOpen || !imgSrc) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-4 cursor-zoom-out" 
      onClick={onClose}
    >
      <img 
        src={imgSrc} 
        className="max-w-full max-h-full object-contain animate-in zoom-in duration-300" 
        alt="Zoomed" 
      />
    </div>
  );
};

export default ImageZoomOverlay;
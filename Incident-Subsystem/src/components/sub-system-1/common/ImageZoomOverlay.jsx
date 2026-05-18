import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../services/sub-system-1/Api';
import {
  loadResidentDocumentSource,
  markResidentDocumentSourceAsMissing,
} from '../../../utils/residentDocuments';

const ImageZoomOverlay = ({ isOpen, imgSrc, onClose }) => {
  const [displaySrc, setDisplaySrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let revoke = null;

    if (!isOpen || !imgSrc) {
      setDisplaySrc(null);
      setLoading(false);
      setError(false);
      return () => {};
    }

    const loadImage = async () => {
      setLoading(true);
      setError(false);

      const result = await loadResidentDocumentSource(imgSrc, api);
      if (!active) {
        result.revoke?.();
        return;
      }

      revoke = result.revoke;

      if (result.kind === 'ready') {
        setDisplaySrc(result.src);
        setError(false);
      } else {
        setDisplaySrc(null);
        setError(true);
      }

      setLoading(false);
    };

    loadImage();

    return () => {
      active = false;
      revoke?.();
    };
  }, [isOpen, imgSrc]);

  const handleImageError = () => {
    if (displaySrc && !displaySrc.startsWith('blob:')) {
      markResidentDocumentSourceAsMissing(displaySrc);
    }

    setDisplaySrc(null);
    setLoading(false);
    setError(true);
  };

  if (!isOpen) return null;

  const overlay = (
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-4 cursor-zoom-out" 
      onClick={onClose}
    >
      {loading ? (
        <div className="text-white text-sm">Loading image…</div>
      ) : error ? (
        <div className="text-white text-sm">Failed to load image</div>
      ) : (
        <img 
          src={displaySrc || imgSrc} 
          className="max-w-full max-h-full object-contain animate-in zoom-in duration-300" 
          alt="Zoomed"
          onError={handleImageError}
        />
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(overlay, document.body) : overlay;
};

export default ImageZoomOverlay;

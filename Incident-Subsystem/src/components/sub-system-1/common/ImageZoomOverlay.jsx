import React, { useEffect, useState } from 'react';
import api from '../../../services/sub-system-1/Api';

const ImageZoomOverlay = ({ isOpen, imgSrc, onClose }) => {
  const [displaySrc, setDisplaySrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    if (!isOpen || !imgSrc) {
      setDisplaySrc(null);
      setLoading(false);
      setError(false);
      return () => {};
    }

    const loadImage = async () => {
      if (imgSrc.startsWith('blob:') || !imgSrc.includes('resident-documents')) {
        setDisplaySrc(imgSrc);
        setError(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const response = await api.get(imgSrc, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(response.data);
        if (active) {
          setDisplaySrc(objectUrl);
        }
      } catch (err) {
        console.error('ImageZoomOverlay failed to load image:', err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadImage();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isOpen, imgSrc]);

  if (!isOpen) return null;

  return (
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
        />
      )}
    </div>
  );
};

export default ImageZoomOverlay;
import React, { useEffect, useRef, useState } from 'react';
import { Bell, X, Eye } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 
import { useSound } from '../../../hooks/shared/useSound';
import { verificationService } from '../../../services/sub-system-1/verification';

const POLL_INTERVAL_MS = 1000;

//UPDATE

const VerificationNotificationListener = () => {
  const { playFeedback } = useSound();
  const navigate = useNavigate(); 
  const [notificationBanner, setNotificationBanner] = useState(null);
  const lastPendingCountRef = useRef(null);
  const bannerTimerRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const loadPendingCount = async () => {
      if (isFetchingRef.current) return;
      
      isFetchingRef.current = true;
      try {
        const submissions = await verificationService.getSubmissions();
        const pendingCount = submissions.filter((s) => s.status === 'Pending').length;

        if (lastPendingCountRef.current !== null && pendingCount > lastPendingCountRef.current) {
          const newCount = pendingCount - lastPendingCountRef.current;
          
          // Sound effect 
          playFeedback('notify');

          setNotificationBanner({ newCount, totalPending: pendingCount });

          // Auto-hide banner after 10 seconds
          if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
          bannerTimerRef.current = setTimeout(() => setNotificationBanner(null), 10000); 
        }

        lastPendingCountRef.current = pendingCount;
      } catch (error) {
        console.error('Failed to check pending verification notifications:', error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    const interval = setInterval(loadPendingCount, POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [playFeedback, navigate]);

  if (!notificationBanner) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[110] animate-in slide-in-from-top-3 duration-300">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/95 backdrop-blur-md p-4 shadow-2xl shadow-emerald-900/20">
        
        {/* Header Part */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 rounded-xl bg-emerald-600 text-white shadow-lg">
            <Bell size={18} className="animate-bounce" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[1px] text-emerald-700 opacity-70">
              System Notification
            </p>
            <p className="text-sm text-emerald-900 font-bold mt-0.5">
              {notificationBanner.newCount} New Registration{notificationBanner.newCount > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-emerald-700/80">
              Total pending for review: {notificationBanner.totalPending}
            </p>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            className="p-1 hover:bg-emerald-200/50 rounded-full transition-colors text-emerald-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* VIEW LIST BUTTON */}
        <button
          onClick={() => {
            navigate('/verification');
            setNotificationBanner(null); 
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-600/20"
        >
          <Eye size={14} />
          VIEW PENDING LIST
        </button>
      </div>
    </div>
  );
};

export default VerificationNotificationListener;

import React, { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSound } from '../../../hooks/shared/useSound';
import { verificationService } from '../../../services/sub-system-1/verification';

const POLL_INTERVAL_MS = 5000;

const VerificationNotificationListener = () => {
  const { playFeedback }      = useSound();
  const navigate              = useNavigate();
  const location              = useLocation();
  const [notificationBanner, setNotificationBanner] = useState(null);

  const lastCountKey    = 'admin_last_pending_count';
  const bannerTimerRef  = useRef(null);
  const isFetchingRef   = useRef(false);

  useEffect(() => {
    const loadPendingCount = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      try {
        const raw = await verificationService.getSubmissions();

        // ── FIX: getSubmissions() may return either:
        //   • an array directly: [{ status, ... }, ...]
        //   • an object with a data/submissions key: { data: [...] } or { submissions: [...] }
        // We normalize here so the rest of the logic is safe.
        let submissions;
        if (Array.isArray(raw)) {
          submissions = raw;
        } else if (raw && Array.isArray(raw.data)) {
          submissions = raw.data;
        } else if (raw && Array.isArray(raw.submissions)) {
          submissions = raw.submissions;
        } else {
          // Unexpected shape — log and bail gracefully, don't crash the poller
          console.warn('[NotifListener] Unexpected getSubmissions() shape:', raw);
          return;
        }

        // Count Pending (public registrations waiting for review)
        const pendingCount = submissions.filter(
          (s) => s.status?.toLowerCase() === 'pending'
        ).length;

        const savedCount    = sessionStorage.getItem(lastCountKey);
        const previousCount = savedCount !== null ? parseInt(savedCount, 10) : null;

        if (previousCount !== null && pendingCount > previousCount) {
          const newCount = pendingCount - previousCount;
          playFeedback('notify');
          setNotificationBanner({ newCount, totalPending: pendingCount });

          if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
          bannerTimerRef.current = setTimeout(() => setNotificationBanner(null), 10000);
        }

        sessionStorage.setItem(lastCountKey, pendingCount.toString());

      } catch (error) {
        if (error?.response?.status === 401) {
          console.warn('[NotifListener] Unauthorized — stopping poll.');
          return;
        }
        // Non-401 errors (network hiccup, etc.) are silently ignored so the
        // interval keeps running and retries on the next tick.
        console.error('[NotifListener] Poll error:', error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    loadPendingCount();
    const interval = setInterval(loadPendingCount, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [playFeedback]);

  const handleViewPending = () => {
    const targetPath     = '/admin/user-management';
    const isAlreadyOnPage = location.pathname === targetPath;

    if (isAlreadyOnPage) {
      window.dispatchEvent(new CustomEvent('refreshVerificationData', {
        detail: { switchToTab: 'Pending' },
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(targetPath);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshVerificationData', {
          detail: { switchToTab: 'Pending' },
        }));
      }, 100);
    }
    setNotificationBanner(null);
  };

  if (!notificationBanner) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[2600] animate-in slide-in-from-top-3 duration-300">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/95 backdrop-blur-md p-4 shadow-2xl shadow-emerald-900/20">
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

        <button
          onClick={handleViewPending}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wider"
        >
          VIEW PENDING LIST
        </button>
      </div>
    </div>
  );
};

export default VerificationNotificationListener;

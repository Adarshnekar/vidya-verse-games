/**
 * OfflineBanner.tsx
 * Small, unobtrusive sticky banner shown only when the browser is offline.
 * Disappears automatically when connectivity returns.
 * Does NOT redirect or reload. Does NOT affect authentication state.
 */
import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline && isOnline) {
      // Just came back online — show a brief "reconnected" flash
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold transition-all duration-300 ${
        !isOnline
          ? 'bg-red-600 text-white'
          : 'bg-emerald-600 text-white'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            You're offline — your session and progress are preserved. Some features may be
            unavailable until you reconnect.
          </span>
        </>
      ) : (
        <>
          <Wifi className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Back online — connection restored!</span>
        </>
      )}
    </div>
  );
}

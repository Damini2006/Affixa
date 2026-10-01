import { useEffect, useState } from 'react';

const STORAGE_KEY = 'affixa-reset-cooldown';
// Supabase's built-in email service allows only a handful of auth emails per
// hour per project (measured ~10 min between free slots in practice). Gate
// resends with a live countdown so clicks can't burn the quota and surface a
// raw 429 to the user.
const COOLDOWN_MS = 10 * 60 * 1000;

const readEnd = (): number => {
  try {
    return Number(sessionStorage.getItem(STORAGE_KEY) || 0);
  } catch {
    return 0;
  }
};

const formatRemaining = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const useResetCooldown = () => {
  const [end, setEnd] = useState(readEnd);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (end <= Date.now()) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= end) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [end]);

  const active = end > now;
  const remaining = Math.max(0, end - now);

  const start = () => {
    const next = Date.now() + COOLDOWN_MS;
    try {
      sessionStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // sessionStorage unavailable (private mode) — cooldown still works in-memory
    }
    setNow(Date.now());
    setEnd(next);
  };

  return { active, remaining, label: formatRemaining(remaining), start };
};

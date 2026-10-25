import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

function msUntilNextMidnight(now: Date): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(1, next.getTime() - now.getTime());
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/**
 * Shared "today" source for date pickers. It refreshes at midnight and when the
 * app/tab becomes active again, so an open picker does not keep yesterday's
 * disabled future/current state.
 */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      const now = new Date();
      setToday(prev => (sameDay(prev, now) ? prev : now));
    };

    const schedule = () => {
      timer = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilNextMidnight(new Date()) + 50);
    };

    schedule();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });

    return () => {
      if (timer != null) clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return today;
}

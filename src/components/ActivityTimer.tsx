import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { formatClock } from '../utils/format';
import { ClockIcon } from './CategoryIcon';

/**
 * Countdown for timed cards (Accent Mode, Freeze Frame…). Uses wall-clock
 * time so it stays accurate if the tab sleeps.
 */
export function ActivityTimer({ seconds }: { seconds: number }) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [pausedLeft, setPausedLeft] = useState(seconds);
  const [now, setNow] = useState(() => Date.now());
  const buzzed = useRef(false);

  const running = endsAt !== null;
  const left = running ? Math.max(0, (endsAt - now) / 1000) : pausedLeft;
  const done = left <= 0;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (done && running && !buzzed.current) {
      buzzed.current = true;
      navigator.vibrate?.([200, 100, 200]);
    }
  }, [done, running]);

  function toggle() {
    if (done) {
      buzzed.current = false;
      setPausedLeft(seconds);
      setEndsAt(null);
      return;
    }
    if (running) {
      setPausedLeft(left);
      setEndsAt(null);
    } else {
      setNow(Date.now());
      setEndsAt(Date.now() + left * 1000);
    }
  }

  const pct = Math.min(100, Math.max(0, (1 - left / seconds) * 100));
  const label = done ? 'Time! Reset' : running ? 'Pause' : left < seconds ? 'Resume' : 'Start timer';

  return (
    <button
      type="button"
      className={`timer ${running ? 'is-running' : ''} ${done ? 'is-done' : ''}`}
      onClick={toggle}
      style={{ '--timer-pct': `${pct}%` } as CSSProperties}
    >
      <ClockIcon size={18} />
      <span className="timer__clock">{done ? 'TIME!' : formatClock(left)}</span>
      <span className="timer__label">{label}</span>
    </button>
  );
}

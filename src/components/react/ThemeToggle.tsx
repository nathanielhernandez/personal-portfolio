import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { IconSunFilled, IconMoonFilled } from '@tabler/icons-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import '../../styles/components/mobileMenu.css';

type Preference = 'system' | 'light' | 'dark';
type Theme = 'light' | 'dark';

declare global {
  interface Window {
    applyTheme?: () => void;
  }
}

const LIGHT_QUERY = '(prefers-color-scheme: light)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function setRevealOrigin(button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  );

  const root = document.documentElement.style;
  root.setProperty('--theme-x', `${x}px`);
  root.setProperty('--theme-y', `${y}px`);
  root.setProperty('--theme-r', `${radius}px`);
}

function readSavedPreference(): Preference {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'system';
}

export default function ThemeToggle() {
  const [preference, setPreference] = useState<Preference | null>(null);
  const [osPrefersLight, setOsPrefersLight] = useState(false);
  const latestTransition = useRef<ViewTransition | null>(null);
  const hasToggled = useRef<boolean>(false);

  useEffect(() => {
    setPreference(readSavedPreference());

    const query = matchMedia(LIGHT_QUERY);
    setOsPrefersLight(query.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setOsPrefersLight(event.matches);
    };

    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const osTheme: Theme = osPrefersLight ? 'light' : 'dark';
  const current: Theme | null =
    preference === null ? null : preference === 'system' ? osTheme : preference;

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    if (current === null) return;

    hasToggled.current = true;

    const next: Theme = current === 'light' ? 'dark' : 'light';

    const nextPreference: Preference = next === osTheme ? 'system' : next;

    const apply = () => {
      try {
        if (nextPreference === 'system') localStorage.removeItem('theme');
        else localStorage.setItem('theme', nextPreference);
      } catch {}

      window.applyTheme?.();
      flushSync(() => setPreference(nextPreference));
    };

    const canAnimate =
      'startViewTransition' in document &&
      !matchMedia(REDUCED_MOTION_QUERY).matches;

    if (!canAnimate) {
      apply();
      return;
    }

    const html = document.documentElement;
    setRevealOrigin(event.currentTarget);

    html.classList.add('theme-transition');

    const transition = document.startViewTransition(apply);
    latestTransition.current = transition;

    transition.finished.finally(() => {
      if (latestTransition.current === transition) {
        html.classList.remove('theme-transition');
      }
    });
  };

  return (
    <button
      type="button"
      className="menuButton"
      onClick={toggle}
      aria-label="Dark theme"
      aria-pressed={current === null ? undefined : current === 'dark'}
      style={{ overflow: 'hidden' }}
    >
      {current === null ? (
        <span style={{ width: 24, height: 24 }} aria-hidden="true" />
      ) : current === 'dark' ? (
        <IconSunFilled aria-hidden="true" />
      ) : (
        <IconMoonFilled aria-hidden="true" />
      )}
    </button>
  );
}

import { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { IconMenu2Filled, IconXFilled } from '@tabler/icons-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import '../../styles/mobileMenu.css';
import { button } from 'motion/react-client';

interface NavItem {
  title: string;
  href: string;
  active: boolean;
}

interface MobileMenuProps {
  nav: NavItem[];
}

interface NavButtonProps {
  href: string;
  children: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ href, active, children, onClick }: NavButtonProps) => {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[active && 'mobileNavItemActive', 'mobileNavItem']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {active ? <motion.div layoutId="sideline" className="sideline" /> : null}
    </a>
  );
};

export default function MobileMenu({ nav }: MobileMenuProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>('dark');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const panelID = useId();

  const onClick = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    root.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return (): void => {
      root.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <MotionConfig reducedMotion="user">
      <button
        type="button"
        className="menuButton"
        onClick={onClick}
        aria-expanded={open}
        aria-label="Menu"
        ref={buttonRef}
        aria-controls={panelID}
      >
        {open ? <IconXFilled /> : <IconMenu2Filled />}
      </button>

      {open && (
        <div
          key="backdrop"
          className="mobileMenuBackdrop"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="mobileMenuClip" id={panelID}>
        <AnimatePresence>
          {open && (
            <motion.nav
              key="nav"
              aria-label="Main"
              initial={{ y: '-100%' }}
              exit={{ y: '-110%' }}
              animate={{ y: 0 }}
              className="mobileMenuContainer"
            >
              <ul>
                {nav.map((item) => (
                  <li key={item.href} style={{ position: 'relative' }}>
                    <NavItem
                      href={item.href}
                      active={item.active}
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </NavItem>
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

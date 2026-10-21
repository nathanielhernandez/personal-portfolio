import { MotionConfig, motion } from 'motion/react';
import '../../styles/components/navMenu.css';

type NavItem = {
  title: string;
  href: string;
  active: boolean;
};

interface NavProps {
  navItems: NavItem[];
}

export default function Nav({ navItems }: NavProps) {
  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Main" className="desktopNavigation">
        <ul>
          {navItems.map((item) => (
            <li key={item.title}>
              <a
                href={item.href}
                className={['navItem', item.active && 'active']
                  .filter(Boolean)
                  .join(' ')}
                aria-current={item.active ? 'page' : false}
              >
                {item.title}
                {item.active ? (
                  <motion.div layoutId="underline" className="underline" />
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </MotionConfig>
  );
}

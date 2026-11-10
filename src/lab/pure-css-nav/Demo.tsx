import { useState } from 'react';
import styles from './Demo.module.css';

const LINKS = ['Home', 'About', 'Contact'];

export default function Demo() {
  const [active, setActive] = useState('Home');

  return (
    <div className={styles.main}>
      <nav data-preview>
        <ul>
          {LINKS.map((link) => (
            <li
              className={link === active ? styles.active : undefined}
              key={link}
            >
              <a
                href="#"
                className={styles.link}
                aria-current={link === active ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(link);
                }}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

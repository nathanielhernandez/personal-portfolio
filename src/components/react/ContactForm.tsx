import { useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { useForm, ValidationError } from '@formspree/react';
import {
  IconExternalLinkFilled,
  IconChevronRightFilled,
} from '@tabler/icons-react';
import '../../styles/components/contact.css';

const OPTIONS = [
  { text: "See what I'm up to now", isExternal: false, href: '/now' },
  { text: 'Read more about me', isExternal: false, href: '/about' },
  {
    text: 'Find me on GitHub',
    isExternal: true,
    href: 'https://www.github.com/nathanielhernandez',
  },
  {
    text: 'Connect on LinkedIn',
    isExternal: true,
    href: 'https://www.linkedin.com/in/nathanielhernandez/',
  },
];

export default function ContactForm({ children }: any) {
  const [state, handleSubmit, reset] = useForm('xaeqaozb');
  const [email, setEmail] = useState('');

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget);
    setEmail(String(data.get('email') ?? ''));
    handleSubmit(e);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div role="status" aria-live="polite">
        <AnimatePresence initial={false} mode="wait">
          {state.succeeded ? (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="contactSent"
            >
              <div className="message">
                <h2 className="contactMessage">Message sent</h2>
                <p>
                  Thanks for reaching out. I'll reply to
                  {email ? (
                    <span className="contactEmail">{email}</span>
                  ) : (
                    ' you'
                  )}{' '}
                  within a couple of days.
                </p>
                <button className="link" onClick={reset}>
                  Send another message
                </button>
              </div>
              <div className="secondary">
                In the meantime
                <ul className="contactOptions">
                  {OPTIONS.map((opt) => (
                    <li key={opt.href}>
                      <a
                        className="option"
                        href={opt.href}
                        target={opt.isExternal ? '_blank' : undefined}
                        rel={opt.isExternal ? 'noopener noreferrer' : undefined}
                      >
                        {opt.text}
                        {opt.isExternal ? (
                          <IconExternalLinkFilled
                            size={'1em'}
                            color="var(--accent-color)"
                            aria-hidden="true"
                          />
                        ) : (
                          <IconChevronRightFilled
                            size={'1em'}
                            color="var(--accent-color)"
                            aria-hidden="true"
                          />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="contactForm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="contactForm"
              onSubmit={onSubmit}
            >
              <div className="inputContainer">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="Your email..."
                />
              </div>
              <ValidationError
                prefix="Email"
                field="email"
                errors={state.errors}
              />
              <div className="inputContainer">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={9}
                  placeholder="Your message..."
                />
              </div>
              <ValidationError
                prefix="Message"
                field="message"
                errors={state.errors}
              />
              {children}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

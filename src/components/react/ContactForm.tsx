import { useForm, ValidationError } from '@formspree/react';
import '../../styles/contact.css';

export default function ContactForm({ children }: any) {
  const [state, handleSubmit] = useForm('xaeqaozb');
  if (state.succeeded) {
    return <p>Thanks for joining!</p>;
  }
  return (
    <form className="contactForm" onSubmit={handleSubmit}>
      <div className="inputContainer">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="email"
        />
      </div>
      <ValidationError prefix="Email" field="email" errors={state.errors} />
      <div className="inputContainer">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={9}
          placeholder="What would you like to talk about?"
        />
      </div>
      <ValidationError prefix="Message" field="message" errors={state.errors} />
      {children}
    </form>
  );
}

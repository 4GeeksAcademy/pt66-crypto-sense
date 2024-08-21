import React from 'react';
import './contact.css';

export const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1 className="contact-title">Get in Touch</h1>
        <p className="contact-description">
          We’d love to hear from you! Whether you have a question about our platform,
          need assistance, or just want to share your thoughts, feel free to reach out.
        </p>
        <form className="contact-form">
          <input
            type="text"
            placeholder="Your Name"
            className="contact-input"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="contact-input"
          />
          <textarea
            placeholder="Your Message"
            className="contact-textarea"
          ></textarea>
          <button type="submit" className="contact-button">Send Message</button>
        </form>
      </div>
    </div>
  );
};

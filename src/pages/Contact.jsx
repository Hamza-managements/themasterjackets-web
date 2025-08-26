import React, { useRef, useState ,useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../App.css';
import Header from '../components/Header';
import CartSidebar from '../components/Cart';
import Footer from '../components/Footer';

const ContactForm = () => {
     useEffect(() => {
        AOS.init();
      }, []);
  const formRef = useRef();
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const formData = new FormData(formRef.current);

    try {
      const res = await fetch('https://formspree.io/f/meogznej', {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams(formData).toString(),
      });

      const data = await res.json();
      
      if (data.ok || res.ok) {
        setStatus({ 
          type: 'success', 
          message: 'Message sent successfully! We will get back to you soon.' 
        });
        formRef.current.reset();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.message || 'There was an error submitting your form. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="container-2">
      <div className="form-header">
        <h1>Contact Us</h1>
        <p>Have questions? Fill out the form and we'll respond shortly.</p>
      </div>

      <form 
        ref={formRef} 
        className="contact-us-form" 
        onSubmit={handleSubmit}
        aria-label="Contact form"
      >
        {status && (
          <div 
            className={`status-message ${status.type}`}
            role="alert"
            aria-live="polite"
          >
            {status.message}
          </div>
        )}

        <div className="contact-us-form-group">
          <label htmlFor="name">Full Name*</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            aria-required="true"
          />
        </div>

        <div className="contact-us-form-group">
          <label htmlFor="email">Email*</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            aria-required="true"
          />
        </div>

        <div className="contact-us-form-group">
          <label htmlFor="phone">Phone</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            aria-describedby="phone-help"
          />
          <small id="phone-help" className="help-text">
            Optional - include if you'd prefer a phone call
          </small>
        </div>

        <div className="contact-us-form-group">
          <label htmlFor="subject">Subject</label>
          <select 
            id="subject" 
            name="subject" 
            defaultValue=""
            aria-describedby="subject-help"
          >
            <option value="" disabled>Select a subject</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Support">Support</option>
            <option value="Sales">Sales</option>
            <option value="Feedback">Feedback</option>
            <option value="Other">Other</option>
          </select>
          <small id="subject-help" className="help-text">
            What is your message about?
          </small>
        </div>

        <div className="contact-us-form-group full-width">
          <label htmlFor="message">Your Message*</label>
          <textarea 
            id="message" 
            name="message" 
            required 
            aria-required="true"
            rows="5"
          ></textarea>
        </div>

        <div className="contact-us-form-group full-width" style={{ textAlign: 'center' }}>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span className="paper-plane" aria-hidden="true"></span>
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="contact-info">
        <div className="info-item">
          <div className="info-icon" aria-hidden="true">
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <div className="info-content">
            <h3>Our Location</h3>
            <address>
              123 Business Ave, Suite 100<br />
              San Francisco, CA 94107
            </address>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon" aria-hidden="true">
            <i className="fas fa-phone"></i>
          </div>
          <div className="info-content">
            <h3>Call Us</h3>
            <p>
              <a href="tel:+18005551234">+1 (800) 555-1234</a><br />
              Mon-Fri, 9am–5pm PST
            </p>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon" aria-hidden="true">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="info-content">
            <h3>Email Us</h3>
            <p>
              <a href="mailto:info@yourcompany.com">info@yourcompany.com</a><br />
              Response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ContactForm;
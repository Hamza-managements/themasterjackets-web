import React from 'react';
import './styles/Return&Contact.css';
import { Link } from 'react-router-dom';


const ReturnPolicy = () => {
  return (
    <>
      <div className="return-policy-page">
        <div className="policy-header">
          <div className="container">
            <h1>Returns & Exchanges</h1>
            <p>We want you to be completely satisfied with your purchase. Here's everything you need to know about our return and exchange process.</p>
          </div>
        </div>

        <div className="container">
          {/* Return Policy Section */}
          <section className="policy-section">
            <h2 className="section-title">Our Return Policy</h2>

            <div className="policy-card">
              <h3><i className="fas fa-undo-alt"></i> General Returns</h3>
              <p>We accept returns within 30 days of purchase for most items. To be eligible for a return:</p>
              <ul className="policy-list">
                <li>Item must be unused and in its original condition</li>
                <li>Original packaging must be intact</li>
                <li>Proof of purchase is required</li>
              </ul>
              <p>Some items are final sale and not eligible for return, including custom orders and clearance items.</p>
            </div>

            <div className="policy-card">
              <h3><i className="fas fa-truck"></i> Return Shipping</h3>
              <p>Customers are responsible for return shipping costs unless the return is due to our error. We recommend using a trackable shipping service.</p>
              <p>For international returns, please note that any customs fees or import taxes are non-refundable.</p>
            </div>

            <div className="policy-card">
              <h3><i className="fas fa-money-bill-wave"></i> Refunds</h3>
              <p>Once your return is received and inspected, we'll notify you of the approval or rejection of your refund. If approved:</p>
              <ul className="policy-list">
                <li>Refunds will be processed to the original payment method</li>
                <li>Processing may take 5-10 business days after approval</li>
                <li>Shipping costs are non-refundable (unless due to our error)</li>
              </ul>
            </div>
          </section>

          {/* Exchange Policy Section */}
          <section className="policy-section">
            <h2 className="section-title">Exchange Policy</h2>

            <div className="policy-card">
              <h3><i className="fas fa-exchange-alt"></i> Item Exchanges</h3>
              <p>We're happy to exchange items within 30 days of purchase if you received a defective or incorrect item, or if you'd like a different size/color.</p>
              <p>To request an exchange:</p>
              <ul className="policy-list">
                <li>Contact our customer service team</li>
                <li>Provide your order number and details</li>
                <li>We'll guide you through the process</li>
              </ul>
              <p>You may be responsible for return shipping costs and any price difference for the new item.</p>
            </div>

            <h3 className="section-title" style={{ marginTop: '60px' }}>How It Works</h3>
            <div className="process-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <h4>Contact Us</h4>
                <p>Email returns@yourbrand.com with your order number and reason for return/exchange</p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <h4>Package Items</h4>
                <p>Securely pack items in original packaging with all tags attached</p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <h4>Ship Back</h4>
                <p>Mail your return to our warehouse (address provided in approval email)</p>
              </div>

              <div className="step-card">
                <div className="step-number">4</div>
                <h4>Receive Refund/Exchange</h4>
                <p>Processing begins immediately upon receipt at our facility</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <h2>Need Help With Your Return?</h2>
            <p>Our customer service team is here to assist you with any questions about returns or exchanges.</p>
            <Link to="/contact-us" className="cta-btn">Contact Returns Team</Link>

          </section>

          {/* Exceptions Section */}
          <section className="policy-section">
            <h2 className="section-title">Exceptions</h2>

            <div className="policy-card">
              <h3><i className="fas fa-exclamation-circle"></i> Non-Returnable Items</h3>
              <p>The following items cannot be returned or exchanged:</p>
              <ul className="policy-list">
                <li>Custom or made-to-order products</li>
                <li>Final sale items (marked as such at purchase)</li>
                <li>Gift cards</li>
                <li>Personalized items</li>
                <li>Products damaged by misuse</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ReturnPolicy;

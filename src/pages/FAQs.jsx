import React from 'react';
import { Link } from 'react-router-dom';
import './FAQs.css';

const faqSections = [
  {
    title: "About Khaddar",
    questions: [
      {
        question: "What is Khaddar?",
        answer: "Khaddar is a homegrown brand celebrating authentic Indian textiles. Our collections are inspired by different regions of India, promoting traditional craftsmanship and supporting local artisans."
      }
    ]
  },
  {
    title: "Shipping & Delivery",
    questions: [
      {
        question: "Do you deliver all over India?",
        answer: "Yes, we currently deliver across India. International shipping is not available at the moment."
      },
      {
        question: "How long does delivery take?",
        answer: "Orders are dispatched within 5–7 working days. Delivery time may vary depending on your location."
      }
    ]
  },
  {
    title: "Cancellation & Refunds",
    questions: [
      {
        question: "Can I cancel my order?",
        answer: "Orders can be cancelled within 24 hours of placing the order, provided the item has not been shipped. Once dispatched, cancellations are not accepted."
      },
      {
        question: "Do you offer refunds?",
        answer: "We do not offer refunds except in cases where the product delivered is damaged or incorrect. Such issues must be reported within 48 hours of delivery with unboxing photos or videos."
      }
    ]
  },
  {
    title: "Exchanges",
    questions: [
      {
        question: "Can I exchange my product?",
        answer: "Yes, exchanges are accepted within 48 hours of delivery for size issues or defects. The item must be unused, unwashed, and returned with original tags. You may exchange for a different size or another product of equal or higher value."
      }
    ]
  },
  {
    title: "Payment Options",
    questions: [
      {
        question: "What payment options are available?",
        answer: "We accept all major online payment methods, including credit/debit cards, UPI, and net banking. We currently do not offer Cash on Delivery (COD)."
      }
    ]
  },
  {
    title: "Care Instructions",
    questions: [
      {
        question: "How should I care for my Khaddar products?",
        answer: "Natural dyes and handloom fabrics last longer when cared for properly. We recommend using mild soap, line drying in shade, and dry cleaning delicate fabrics like silk."
      }
    ]
  },
  {
    title: "Student Internships",
    questions: [
      {
        question: "Does Khaddar offer internships for students?",
        answer: "We are open to collaborating with students! Reach out to us to share your designs. Khaddar may fund your creation and feature it on our platform, giving full credit to the student designer."
      }
    ]
  }
];

const FAQs = () => {
  return (
    <div className="policy-page">
      {/* Logo Watermark like Policy Page */}
      <div className="policy-watermark">
        <img src="/logo_file_page-0001.png" alt="" className="watermark-logo" />
      </div>

      <div className="policy-container">
        <div className="policy-header">
          <h1 className="policy-title">Frequently Asked Questions</h1>
        </div>
        
        <div className="policy-content">
          {faqSections.map((section, index) => (
            <div key={index} className="policy-section">
              <h2 className="policy-section-heading" style={{ color: '#6F3132', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '40px' }}>
                {section.title}
              </h2>
              {section.questions.map((item, qIndex) => (
                <div key={qIndex} className="faq-sub-section" style={{ marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#333' }}>{item.question}</h3>
                  <p className="policy-section-text">{item.answer}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="policy-footer-note">
          <p>If your question isn't answered here, please <Link to="/contact">contact us</Link>.</p>
        </div>

        <div className="policy-navigation">
          <Link to="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Quick Links to Policies */}
        <div className="policy-quick-links">
          <h3>Our Policies</h3>
          <div className="quick-links-grid">
            <Link to="/exchange-policy" className="quick-link-item">Exchange Policy</Link>
            <Link to="/refund-policy" className="quick-link-item">Refund Policy</Link>
            <Link to="/shipping-policy" className="quick-link-item">Shipping Policy</Link>
            <Link to="/privacy-policy" className="quick-link-item">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
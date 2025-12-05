import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './PolicyPage.css';

const policies = {
  'exchange-policy': {
    title: 'Exchange Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Exchange Window',
        text: `At Khaddar, we accept exchanges on eligible products within 48 hours of delivery.`
      },
      {
        heading: 'Eligibility Conditions',
        text: `Items must be unused, unwashed, unaltered, and returned with all original tags and packaging.`
      },
      {
        heading: 'Accepted Reasons for Exchange',
        text: `Exchanges are accepted only for size issues, manufacturing defects, or if you wish to exchange for another product.`
      },
      {
        heading: 'Price Difference',
        text: `If you choose to exchange for a different product, any price difference must be paid if the new item is priced higher. Exchanges for products of lower value will not be accepted.`
      },
      {
        heading: 'Handcrafted Variations',
        text: `As our pieces are handcrafted, slight variations in colour, weave, or print are natural and not considered defects.`
      },
      {
        heading: 'Processing',
        text: `Once the returned item passes quality check, the exchange will be processed.`
      }
    ]
  },
  'refund-policy': {
    title: 'Refund Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Limited Quantity Collections',
        text: `Khaddar currently does not offer refunds, as our collections are produced in limited quantities using artisanal techniques.`
      },
      {
        heading: 'Exceptions',
        text: `Refunds are only applicable if the product delivered is damaged or incorrect.`
      },
      {
        heading: 'Reporting Issues',
        text: `Such concerns must be reported within 48 hours of delivery along with clear unboxing images/videos.`
      },
      {
        heading: 'Refund Processing',
        text: `Approved refunds will be processed to the original payment method within 7–10 working days.`
      }
    ]
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Cancellation Window',
        text: `Orders can be cancelled within 24 hours of placing the order, provided the item has not been shipped.`
      },
      {
        heading: 'Post-Dispatch Policy',
        text: `Once dispatched, cancellations cannot be accepted.`
      },
      {
        heading: 'Refund for Cancellations',
        text: `Prepaid cancellation refunds will be processed to the original payment method within 5–7 working days.`
      }
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Our Commitment',
        text: `At Khaddar, your privacy is our priority.`
      },
      {
        heading: 'Information We Collect',
        text: `We collect personal information (name, contact, address, payment details) solely for order processing, delivery, and customer support.`
      },
      {
        heading: 'Data Protection',
        text: `We do not sell or rent your data to any third party. Information is shared only with trusted service providers involved in completing your order.`
      },
      {
        heading: 'Payment Security',
        text: `All payments are processed through secure and encrypted gateways to protect your data.`
      },
      {
        heading: 'Terms Agreement',
        text: `By using our website, you agree to the terms outlined in this policy.`
      }
    ]
  },
  'copyright-policy': {
    title: 'Copyright Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Protected Content',
        text: `All creative content under Khaddar—including product designs, patterns, embroidery work, fabric combinations, photographs, videos, written descriptions, brand logo, graphics, and website content—is protected under applicable copyright and intellectual property laws.`
      },
      {
        heading: 'Unauthorized Use',
        text: `No individual, brand, or entity may copy, reproduce, modify, distribute, or use any of Khaddar's content, designs, or visual materials without prior written permission from the brand.`
      },
      {
        heading: 'Legal Consequences',
        text: `Any unauthorized use of our creative assets, in full or in part, will be considered a violation of intellectual property rights and may lead to legal action.`
      },
      {
        heading: 'Permission Requests',
        text: `For media usage, collaborative projects, or permissions, please contact the Khaddar team directly.`
      }
    ]
  },
  'resale-policy': {
    title: 'Resale & Commercial Use Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Personal Use Only',
        text: `Products purchased from Khaddar are intended strictly for personal use.`
      },
      {
        heading: 'Resale Restrictions',
        text: `Customers are not permitted to resell Khaddar products in boutiques, retail stores, online marketplaces, pop-up shops, or through third-party vendors without an official written agreement or legal contract with the brand.`
      },
      {
        heading: 'Prohibited Activities',
        text: `Unauthorized resale, commercial distribution, repackaging, bulk purchasing for resale, or use of Khaddar products for profit is strictly prohibited.`
      },
      {
        heading: 'Legal Consequences',
        text: `Any individual or business found engaging in such activities may face legal consequences in accordance with commercial and intellectual property laws.`
      },
      {
        heading: 'Partnership Inquiries',
        text: `For wholesale partnerships, retail collaborations, or resale permissions, please reach out to the Khaddar team for an official agreement.`
      }
    ]
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Processing Time',
        text: `All orders are processed within 2-3 business days. Orders are not shipped on weekends or holidays. You will receive a confirmation email with tracking information once your order has been dispatched.`
      },
      {
        heading: 'Domestic Shipping (India)',
        text: `We offer free standard shipping on all orders above ₹2,999. For orders below this amount, a flat shipping fee of ₹99 applies. Standard delivery takes 5-7 business days. Express shipping (2-3 business days) is available for an additional charge.`
      },
      {
        heading: 'International Shipping',
        text: `We currently ship to select international destinations. International shipping charges are calculated at checkout based on the destination and package weight. Delivery times vary by location (typically 10-15 business days).`
      },
      {
        heading: 'Order Tracking',
        text: `Once your order is shipped, you will receive an email with a tracking number. You can use this number to track your package on our website or the carrier's website.`
      },
      {
        heading: 'Delivery Issues',
        text: `If your package is lost, damaged, or significantly delayed, please contact our customer service team. We will work with the shipping carrier to resolve the issue and ensure you receive your order.`
      },
      {
        heading: 'Address Accuracy',
        text: `Please ensure your shipping address is correct and complete. We are not responsible for orders shipped to incorrect addresses provided by the customer. Address changes must be requested within 24 hours of placing the order.`
      },
      {
        heading: 'Customs and Duties',
        text: `For international orders, customers are responsible for any customs duties, taxes, or import fees that may be charged by their country. These fees are not included in the order total and are collected upon delivery.`
      }
    ]
  }
};

const PolicyPage = () => {
  const location = useLocation();
  const policyType = location.pathname.replace('/', '');
  const policy = policies[policyType];

  if (!policy) {
    return (
      <div className="policy-page">
        <div className="policy-container">
          <h1>Policy Not Found</h1>
          <p>The requested policy page could not be found.</p>
          <Link to="/" className="back-link">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="policy-page">
      {/* Logo Watermark */}
      <div className="policy-watermark">
        <img src="/logo_file_page-0001.png" alt="" className="watermark-logo" />
      </div>

      <div className="policy-container">
        <div className="policy-header">
          <h1 className="policy-title">{policy.title}</h1>
          <p className="policy-updated">Last Updated: {policy.lastUpdated}</p>
        </div>
        
        <div className="policy-content">
          {policy.content.map((section, index) => (
            <div key={index} className="policy-section">
              <h2 className="policy-section-heading">{section.heading}</h2>
              <p className="policy-section-text">{section.text}</p>
            </div>
          ))}
        </div>

        <div className="policy-footer-note">
          <p>If you have any questions about this policy, please <Link to="/contact">contact us</Link>.</p>
        </div>

        <div className="policy-navigation">
          <Link to="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Quick Links to Other Policies */}
        <div className="policy-quick-links">
          <h3>Other Policies</h3>
          <div className="quick-links-grid">
            {Object.entries(policies).map(([key, value]) => (
              key !== policyType && (
                <Link key={key} to={`/${key}`} className="quick-link-item">
                  {value.title}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;

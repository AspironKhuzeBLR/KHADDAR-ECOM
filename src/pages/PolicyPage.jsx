import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './PolicyPage.css';

const policies = {
  'privacy-policy': {
    title: 'Privacy Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Information We Collect',
        text: `We collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us for support. This information may include your name, email address, postal address, phone number, and payment information.`
      },
      {
        heading: 'How We Use Your Information',
        text: `We use the information we collect to process transactions, send you order confirmations and updates, respond to your comments and questions, send you marketing communications (with your consent), and improve our services.`
      },
      {
        heading: 'Information Sharing',
        text: `We do not sell, trade, or otherwise transfer your personal information to outside parties except to trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.`
      },
      {
        heading: 'Data Security',
        text: `We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.`
      },
      {
        heading: 'Cookies',
        text: `We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.`
      },
      {
        heading: 'Your Rights',
        text: `You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications from us at any time by clicking the unsubscribe link in our emails or contacting us directly.`
      },
      {
        heading: 'Contact Us',
        text: `If you have any questions about this Privacy Policy, please contact us at privacy@khaddar.com.`
      }
    ]
  },
  'refund-policy': {
    title: 'Refund Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Eligibility for Refunds',
        text: `We want you to be completely satisfied with your purchase. If you are not satisfied, you may request a refund within 7 days of receiving your order. Items must be unused, unworn, and in their original packaging with all tags attached.`
      },
      {
        heading: 'Non-Refundable Items',
        text: `The following items are not eligible for refunds: customized or personalized items, items marked as final sale, intimate apparel, and items that have been worn, washed, or altered.`
      },
      {
        heading: 'Refund Process',
        text: `To initiate a refund, please contact our customer service team at returns@khaddar.com with your order number and reason for the return. Once approved, you will receive instructions for returning the item.`
      },
      {
        heading: 'Refund Timeline',
        text: `Once we receive and inspect your return, we will process your refund within 5-7 business days. The refund will be credited to your original payment method. Please note that it may take an additional 3-5 business days for the refund to appear in your account.`
      },
      {
        heading: 'Return Shipping',
        text: `For eligible returns, return shipping costs are the responsibility of the customer unless the item was defective or incorrect. We recommend using a trackable shipping method.`
      },
      {
        heading: 'Defective or Damaged Items',
        text: `If you receive a defective or damaged item, please contact us within 48 hours of delivery with photos of the damage. We will arrange for a replacement or full refund including shipping costs.`
      }
    ]
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    lastUpdated: 'December 2024',
    content: [
      {
        heading: 'Order Cancellation',
        text: `You may cancel your order within 24 hours of placing it, provided the order has not yet been shipped. To cancel, please contact us immediately at orders@khaddar.com with your order number.`
      },
      {
        heading: 'Cancellation After 24 Hours',
        text: `If more than 24 hours have passed since your order was placed, or if the order has already been dispatched, cancellation may not be possible. In such cases, you may refuse delivery or return the item as per our Refund Policy.`
      },
      {
        heading: 'Refund for Cancelled Orders',
        text: `If your cancellation request is approved, a full refund will be processed to your original payment method within 5-7 business days.`
      },
      {
        heading: 'Partial Cancellation',
        text: `If you wish to cancel only some items from your order, please contact us as soon as possible. Partial cancellations are subject to the same 24-hour window and shipping status conditions.`
      },
      {
        heading: 'Customized Orders',
        text: `Please note that customized or personalized orders cannot be cancelled once production has begun. These orders are final and non-refundable.`
      },
      {
        heading: 'Contact for Cancellation',
        text: `For all cancellation requests, please email orders@khaddar.com or call our customer service line. Include your order number and the items you wish to cancel.`
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

        <div className="policy-footer">
          <p>If you have any questions about this policy, please <Link to="/contact">contact us</Link>.</p>
        </div>

        <div className="policy-navigation">
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;


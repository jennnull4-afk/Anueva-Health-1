export type PolicySection = { heading: string; paragraphs: string[] };
export type LegalPolicy = { title: string; description: string; sections: PolicySection[] };

const updated = "Last updated: September 21, 2026.";

// Attorney review required before commercial launch: confirm entity information, governing law, enforceability, and state-specific language.
export const legalPolicies: Record<string, LegalPolicy> = {
  terms: {
    title: "Terms & Conditions",
    description: "These Terms & Conditions govern your use of Auneva Research and purchases made through this website.",
    sections: [
      { heading: "Eligibility", paragraphs: [updated, "You must be at least 21 years old and legally able to enter into a binding agreement to use this site or place an order. By using the site, you represent that the information you provide is accurate and complete."] },
      { heading: "Research-use restrictions", paragraphs: ["Products are offered solely for legitimate laboratory and research purposes. They are not for human or veterinary consumption, are not drugs or dietary supplements, and are not intended to diagnose, treat, cure, or prevent disease.", "Auneva does not provide human dosing, administration, reconstitution, cycle, treatment, or medical guidance."] },
      { heading: "Account and order information", paragraphs: ["You are responsible for the accuracy of your contact, shipping, and order information. We may decline, limit, or cancel orders when information is incomplete, inaccurate, or inconsistent with these Terms."] },
      { heading: "Pricing and payment", paragraphs: ["Displayed prices are Auneva retail prices and may change before an order is accepted. Payment must be successfully verified through an approved payment provider before an order is submitted for fulfillment. We do not store raw payment card numbers or CVV values."] },
      { heading: "Order acceptance and fulfillment", paragraphs: ["Submitting an order request does not constitute acceptance. Auneva may accept an order after payment verification and may use an independent manufacturing or fulfillment partner to fulfill accepted orders. Those partners do not replace Auneva as the website operator or customer point of contact."] },
      { heading: "Prohibited uses", paragraphs: ["You may not use products for human or veterinary use, unlawful activity, resale where prohibited, or any purpose that conflicts with applicable law, institutional requirements, or product documentation."] },
      { heading: "Intellectual property and third-party services", paragraphs: ["Site content, branding, and materials are owned by or licensed to Auneva and may not be used without permission. Payment providers, fulfillment partners, carriers, and other third-party services operate under their own terms and privacy practices."] },
      { heading: "Disclaimers and limitation language", paragraphs: ["The site and its content are provided on an as-available basis to the extent permitted by law. Auneva does not make warranties beyond those that cannot be disclaimed under applicable law. To the extent permitted by law, Auneva will not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the site or products."] },
      { heading: "Governing law and contact", paragraphs: ["Governing-law, venue, and dispute-resolution terms will be finalized following legal review before commercial launch. For questions about these Terms, contact Auneva Research through our Contact Us page."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "This Privacy Policy explains how Auneva Research handles information connected with our storefront and customer support.",
    sections: [
      { heading: "Information we collect", paragraphs: [updated, "We may collect information you provide, including name, email address, telephone number when supplied, shipping address, order details, and messages sent to our support channels."] },
      { heading: "Checkout and order data", paragraphs: ["We use checkout and order data to create, process, fulfill, support, and track an order. Auneva does not store raw payment card numbers or CVV values; payment information is handled by the approved payment processor."] },
      { heading: "Cookies and analytics", paragraphs: ["We use essential technologies needed for site operation, such as the research-use acknowledgement and cart preferences. We may use analytics or optional technologies as the site evolves; choices and notices will be provided where required."] },
      { heading: "Service providers", paragraphs: ["We may share only the information necessary with payment processors, fulfillment providers, shipping carriers, hosting providers, and support vendors. Auneva distinguishes its website and customer relationship from third-party manufacturing and fulfillment partners."] },
      { heading: "Communications and security", paragraphs: ["We may use contact information for order updates, support, and operational communications. We use reasonable administrative, technical, and organizational measures appropriate to the information handled, but no transmission or system is guaranteed secure."] },
      { heading: "Retention and privacy rights", paragraphs: ["We retain information for as long as reasonably needed for orders, support, compliance, dispute resolution, and legitimate business operations. Depending on your location, you may have rights to request access, correction, deletion, or other information about your data, subject to applicable law."] },
      { heading: "Requests and updates", paragraphs: ["To make a privacy request or ask a question, contact Auneva Research through our Contact Us page. This policy may be updated as our services, legal obligations, or providers change."] },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    description: "This policy describes Auneva Research's shipping framework and the items that will be confirmed before commercial fulfillment begins.",
    sections: [
      { heading: "Processing and shipping methods", paragraphs: [updated, "Processing windows and available shipping methods are shown at checkout when available and may depend on product availability, order review, fulfillment capacity, and destination. Auneva does not promise a specific processing or delivery date unless expressly stated in writing."] },
      { heading: "Tracking and address accuracy", paragraphs: ["When our fulfillment partner provides carrier tracking, it will be available through Track Order. You are responsible for providing a complete and accurate delivery address before payment confirmation."] },
      { heading: "Delays, lost packages, and availability", paragraphs: ["Carrier delays, weather, regulatory activity, address issues, and events outside Auneva's reasonable control may affect delivery. We will review reported lost-package concerns using available carrier and fulfillment information. Domestic and international availability, restrictions, and fees will be confirmed at checkout or before order acceptance."] },
    ],
  },
  returns: {
    title: "Return & Refund Policy",
    description: "This policy provides Auneva Research's framework for return and refund requests for research products.",
    sections: [
      // Attorney and owner approval required before launch: finalize product-specific eligibility, timeframes, exclusions, and refund method.
      { heading: "Review of requests", paragraphs: [updated, "Return and refund eligibility depends on the order condition, applicable law, product handling requirements, and fulfillment circumstances. Business-specific eligibility, timeframes, and exclusions require owner and legal approval before orders are accepted."] },
      { heading: "Damaged, incorrect, or incomplete orders", paragraphs: ["If an order appears damaged, incorrect, or incomplete, contact Auneva promptly with your order ID and supporting information. We may coordinate with the applicable fulfillment partner to investigate and determine an appropriate resolution."] },
      { heading: "No guaranteed outcome", paragraphs: ["A return request does not guarantee a return, replacement, credit, or refund. Approved resolutions will be communicated in writing and processed through the original payment method or another lawful method where appropriate."] },
    ],
  },
  "research-use": {
    title: "Research Use & Compliance",
    description: "Auneva Research products are offered within a strictly research-only framework.",
    sections: [
      { heading: "Research-only purpose", paragraphs: [updated, "Products are offered exclusively for legitimate laboratory and research purposes. They are not intended for human consumption or veterinary consumption."] },
      { heading: "No medical or consumer use", paragraphs: ["Products are not drugs, not dietary supplements, and are not intended to diagnose, treat, cure, or prevent disease. Auneva does not provide human dosing, administration, reconstitution, cycle, treatment, or medical recommendations."] },
      { heading: "Purchaser responsibilities", paragraphs: ["Purchasers are responsible for complying with applicable laws, laboratory safety practices, institutional requirements, and all requirements applicable to their intended research use."] },
      { heading: "Age and acknowledgement", paragraphs: ["Purchasers must be at least 21 years old. Before entering the storefront, visitors must acknowledge the research-only purpose and the prohibition on human and veterinary consumption. This acknowledgement does not replace applicable legal, regulatory, institutional, or safety requirements."] },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    description: "This Cookie Policy explains how Auneva Research uses cookies and similar technologies.",
    sections: [
      { heading: "Essential cookies", paragraphs: [updated, "Essential cookies and local browser storage support core functions such as remembering the research-use acknowledgement and cart state. These functions are necessary for the storefront to operate as intended."] },
      { heading: "Analytics and optional cookies", paragraphs: ["Analytics or optional cookies may be introduced to understand site performance, improve the customer experience, or support communications. Where required, Auneva will provide an appropriate notice and consent mechanism before placing non-essential cookies."] },
      { heading: "Your choices", paragraphs: ["Browser settings may allow you to limit or delete cookies, though essential storefront functions may be affected. Auneva's architecture can support cookie consent preferences where required by applicable law."] },
    ],
  },
  accessibility: {
    title: "Accessibility Statement",
    description: "Auneva Research is committed to making its storefront usable by as many people as possible.",
    sections: [
      { heading: "Our approach", paragraphs: [updated, "We work to improve the accessibility of our content, navigation, forms, and customer workflows as the storefront evolves. Accessibility is an ongoing effort, and some content or third-party services may not yet work equally well for every visitor."] },
      { heading: "Feedback and assistance", paragraphs: ["If you encounter an accessibility barrier or need assistance using this site, contact Auneva Research through our Contact Us page. Please include the page or feature involved and a description of the issue so we can investigate."] },
    ],
  },
};
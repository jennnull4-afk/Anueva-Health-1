"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useState } from "react";

type FaqItem = {
  question: string;
  answer: React.ReactNode;
  confirmationRequired?: boolean;
};

type FaqCategory = {
  title: string;
  items: FaqItem[];
};

const categories: FaqCategory[] = [
  {
    title: "Research Use & Eligibility",
    items: [
      { question: "Who may use the Auneva Research storefront?", answer: <>You must be at least 21 years old and legally able to enter into a binding agreement. Before entering the storefront, visitors must acknowledge the research-only purpose and the prohibition on human and veterinary consumption. Review the full <Link href="/research-use" className="faq-link">Research Use &amp; Compliance policy</Link>.</> },
      { question: "Are Auneva products intended for human or veterinary use?", answer: <>No. Products are offered exclusively for legitimate laboratory and research purposes. They are not intended for human or veterinary consumption, are not drugs or dietary supplements, and are not intended to diagnose, treat, cure, or prevent disease.</> },
      { question: "Does Auneva provide dosing, administration, or medical guidance?", answer: <>No. Auneva does not provide human dosing, administration, reconstitution, cycle, treatment, or medical recommendations. Purchasers are responsible for complying with applicable laws, laboratory safety practices, institutional requirements, and the requirements of their intended research use.</> },
    ],
  },
  {
    title: "Products, Documentation & Pricing",
    items: [
      { question: "Where can I review products and their details?", answer: <>Browse the <Link href="/shop" className="faq-link">research catalog</Link> to review currently available products and the product information supplied for each item. Supplier availability and documentation may vary by product and lot.</> },
      { question: "Are Certificates of Analysis or testing documents available?", answer: <>Certificates of Analysis, HPLC testing, and mass spectrometry identity verification are displayed only when they are supplied and applicable to a product lot. Auneva does not publish specific test results or purity statements without supporting records. See <Link href="/coas-testing" className="faq-link">COAs &amp; Testing</Link> for details.</> },
      { question: "Does Auneva guarantee purity or test results?", answer: <>No. Product-specific purity claims and testing results are presented only where supported by supplier documentation for the applicable lot.</> },
      { question: "Are displayed product prices final?", answer: <>Displayed prices are Auneva retail prices and may change before an order is accepted. Review the <Link href="/terms" className="faq-link">Terms &amp; Conditions</Link> for order and pricing terms.</> },
    ],
  },
  {
    title: "Ordering & Payment",
    items: [
      { question: "When is an order accepted?", answer: <>Submitting an order request does not constitute acceptance. Auneva may accept an order after payment verification and may use an independent manufacturing or fulfillment partner to fulfill accepted orders.</> },
      { question: "What information do I need to provide at checkout?", answer: <>You are responsible for providing complete and accurate contact, shipping, and order information. Auneva may decline, limit, or cancel orders when information is incomplete, inaccurate, or inconsistent with its Terms.</> },
      { question: "Which payment methods are accepted?", answer: <>Payment must be successfully verified through an approved payment provider before an order is submitted for fulfillment. Specific payment methods are not published in the current policy and require business confirmation before they can be listed here.</>, confirmationRequired: true },
      { question: "Does Auneva store payment card numbers or CVV values?", answer: <>No. Auneva does not store raw payment card numbers or CVV values; payment information is handled by the approved payment processor. Read the <Link href="/privacy" className="faq-link">Privacy Policy</Link> for more information.</> },
    ],
  },
  {
    title: "Shipping & Tracking",
    items: [
      { question: "When will my order ship or arrive?", answer: <>Processing windows and available shipping methods are shown at checkout when available. They may depend on product availability, order review, fulfillment capacity, and destination. Auneva does not promise a specific processing or delivery date unless expressly stated in writing.</> },
      { question: "Which destinations, methods, and fees are available?", answer: <>Domestic and international availability, restrictions, shipping methods, and fees are confirmed at checkout or before order acceptance. These details are not yet published as a general schedule.</>, confirmationRequired: true },
      { question: "How do I track an order?", answer: <>When the fulfillment partner provides carrier tracking, it is available through <Link href="/track-order" className="faq-link">Track Order</Link>. Enter the order ID and checkout email to view available fulfillment updates. Tracking details appear after the order has shipped.</> },
      { question: "What if a shipment is delayed or cannot be located?", answer: <>Carrier delays, weather, regulatory activity, address issues, and events outside Auneva&apos;s reasonable control may affect delivery. Reported lost-package concerns are reviewed using available carrier and fulfillment information. Read the <Link href="/shipping" className="faq-link">Shipping Policy</Link>.</> },
    ],
  },
  {
    title: "Returns & Support",
    items: [
      { question: "Can I return a product or request a refund?", answer: <>Return and refund eligibility depends on order condition, applicable law, product handling requirements, and fulfillment circumstances. Product-specific eligibility, timeframes, exclusions, and the refund method require owner and legal approval before orders are accepted.</>, confirmationRequired: true },
      { question: "What should I do if an order is damaged, incorrect, or incomplete?", answer: <>Contact Auneva promptly with your order ID and supporting information. Auneva may coordinate with the applicable fulfillment partner to investigate and determine an appropriate resolution. A request does not guarantee a return, replacement, credit, or refund. See the <Link href="/returns" className="faq-link">Return &amp; Refund Policy</Link>.</> },
      { question: "How can I contact Auneva?", answer: <>Use the <Link href="/contact" className="faq-link">Contact page</Link> for catalog, documentation, or order-support inquiries. The specific contact channel details are pending business-owner confirmation. Do not send payment information or other sensitive information through general correspondence.</>, confirmationRequired: true },
      { question: "Can I create or manage an account?", answer: <>Yes. Create an account from <Link href="/account/register" className="faq-link">Create account</Link> and verify the email before signing in. Guest checkout remains available. Saved payment methods are unavailable because the payment service does not provide a customer vault.</> },
    ],
  },
  {
    title: "Privacy, Cookies & Accessibility",
    items: [
      { question: "What information does Auneva collect?", answer: <>Auneva may collect information you provide, including your name, email address, telephone number when supplied, shipping address, order details, and support messages. This information is used to create, process, fulfill, support, and track orders. Read the <Link href="/privacy" className="faq-link">Privacy Policy</Link>.</> },
      { question: "Does the site use cookies or browser storage?", answer: <>Essential cookies and local browser storage support core functions, including the research-use acknowledgement and cart state. Analytics or optional technologies may be introduced as the storefront evolves, with notices and choices provided where required. See the <Link href="/cookies" className="faq-link">Cookie Policy</Link>.</> },
      { question: "How can I request privacy assistance or report an accessibility barrier?", answer: <>For a privacy request or question, use the <Link href="/contact" className="faq-link">Contact page</Link>. To report an accessibility barrier, include the affected page or feature and a description so Auneva can investigate. Read the <Link href="/accessibility" className="faq-link">Accessibility Statement</Link>.</> },
    ],
  },
];

export function FaqPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleCategories = categories.map((category) => ({ ...category, items: category.items.filter((item) => !normalizedQuery || `${category.title} ${item.question}`.toLowerCase().includes(normalizedQuery)) })).filter((category) => category.items.length > 0);
  const resultCount = visibleCategories.reduce((total, category) => total + category.items.length, 0);

  return <main><section className="page-hero py-12"><div className="mx-auto max-w-4xl px-6"><p className="eyebrow">Answers</p><h1 className="mt-3 font-serif text-5xl text-ink">Frequently asked questions</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Clear, policy-aligned information for research customers before and after ordering.</p><label className="relative mt-8 block max-w-2xl"><span className="sr-only">Search frequently asked questions</span><Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-teal" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions" className="h-12 w-full border border-navy/15 bg-white py-3 pl-11 pr-12 text-sm text-ink outline-teal" />{query && <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-slate-500 hover:text-navy" aria-label="Clear search"><X size={18} /></button>}</label></div></section><section className="mx-auto max-w-4xl px-6 py-10 sm:py-14">{normalizedQuery && <p className="mb-5 text-sm text-slate-600">{resultCount} {resultCount === 1 ? "answer" : "answers"} found</p>}<div className="space-y-8">{visibleCategories.map((category) => <section key={category.title} aria-labelledby={`${category.title.toLowerCase().replaceAll(" ", "-")}-heading`}><h2 id={`${category.title.toLowerCase().replaceAll(" ", "-")}-heading`} className="mb-3 font-serif text-2xl text-ink sm:text-3xl">{category.title}</h2><div className="border-y border-navy/10">{category.items.map((item) => <details key={item.question} open={Boolean(normalizedQuery)} className="group border-b border-navy/10 last:border-b-0"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-semibold leading-6 text-navy marker:hidden hover:text-teal"><span>{item.question}</span><span aria-hidden="true" className="shrink-0 text-xl font-normal text-teal transition-transform group-open:rotate-45">+</span></summary><div className="pb-5 pr-8 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7"><div>{item.answer}</div>{item.confirmationRequired && <p className="mt-4 border-l-2 border-teal bg-teal-50 px-3 py-2 text-sm font-medium text-navy">Confirmation required before this detail can be finalized.</p>}</div></details>)}</div></section>)}</div>{!visibleCategories.length && <div className="border border-navy/10 bg-white p-6 text-center"><p className="font-serif text-2xl text-ink">No matching questions</p><p className="mt-2 text-sm text-slate-600">Try a different search term or <Link href="/contact" className="faq-link">contact Auneva</Link>.</p></div>}<aside className="mt-12 border-l-4 border-teal bg-navy p-6 text-white"><p className="eyebrow text-teal-200">Research-use notice</p><h2 className="mt-3 font-serif text-2xl text-white">For laboratory research use only</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Products are not intended for human or veterinary consumption and are not intended to diagnose, treat, cure, or prevent disease. Review <Link href="/research-use" className="font-semibold text-teal-200 underline underline-offset-4">Research Use &amp; Compliance</Link> before ordering.</p></aside></section></main>;
}
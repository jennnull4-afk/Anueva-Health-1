import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { legalPolicies } from "@/lib/legal-content";

type InformationPage = { eyebrow: string; title: string; description: string; body: string[] };

const informationPages: Record<string, InformationPage> = {
  "coas-testing": { eyebrow: "Documentation", title: "COAs & Testing", description: "Auneva organizes available supplier documentation at the product-lot level where applicable.", body: ["Certificates of Analysis, HPLC testing, and mass spectrometry identity verification are displayed only when supplied and applicable to a product lot.", "Specific test results and purity statements are not published without supporting records."] },
  "research-information": { eyebrow: "Responsible sourcing", title: "Research Information", description: "Auneva Research presents products for legitimate laboratory and research applications only.", body: ["Our documentation-forward catalog helps researchers review available product information without implying use beyond legitimate laboratory work.", "Products are not intended for human or veterinary consumption."] },
  faq: { eyebrow: "Answers", title: "Frequently Asked Questions", description: "Clear information for research customers before and after ordering.", body: ["Where provided by suppliers, lot-specific supporting documentation is associated with qualifying products.", "Use the Track Order page with your order ID and checkout email to view available fulfillment updates.", "For catalog or order questions, contact Auneva Research."] },
  contact: { eyebrow: "Contact", title: "Talk With Auneva", description: "For catalog, documentation, or order-support inquiries, our team is here to help.", body: ["Contact channel details will be confirmed by the business owner before launch.", "Do not send payment information or other sensitive information through general correspondence."] },
  account: { eyebrow: "Account", title: "Your Research Account", description: "Account authentication and profile management are not currently available.", body: ["Use Track Order with the order ID and checkout email to view available shipping updates."] },
};

export function generateStaticParams() {
  return [...Object.keys(legalPolicies), ...Object.keys(informationPages)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPolicies[slug] ?? informationPages[slug];
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: `/${slug}` }, openGraph: { title: page.title, description: page.description } };
}

export default async function InformationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = legalPolicies[slug];
  const information = informationPages[slug];
  if (!policy && !information) notFound();

  const title = policy?.title ?? information.title;
  const description = policy?.description ?? information.description;
  return <><SiteHeader /><main><section className="bg-[#eaf6f5] py-20"><div className="mx-auto max-w-4xl px-6"><p className="eyebrow">{policy ? "Legal" : information.eyebrow}</p><h1 className="mt-4 font-serif text-5xl text-ink sm:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{description}</p></div></section><section className="mx-auto max-w-4xl px-6 py-16">{policy ? <div className="space-y-12">{policy.sections.map((section) => <section key={section.heading}><h2 className="font-serif text-3xl text-ink">{section.heading}</h2><div className="mt-4 space-y-4 text-base leading-7 text-slate-600">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</div> : <div className="space-y-5 border-l-2 border-teal pl-6 text-lg leading-8 text-slate-600">{information.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}<Link href="/contact" className="mt-12 inline-flex items-center gap-2 font-bold text-navy hover:text-teal">Contact Auneva <ArrowRight size={17} /></Link></section></main><SiteFooter /></>;
}

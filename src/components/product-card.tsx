import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";

export const featuredProducts = [
  { name: "Research Peptide Collection", category: "Research material", status: "Documentation on qualifying lots" },
  { name: "Reference Compound Series", category: "Research material", status: "Specifications pending supplier sync" },
  { name: "Laboratory Standards", category: "Research material", status: "Documentation on qualifying lots" },
];

export function ProductCard({ product }: { product: (typeof featuredProducts)[number] }) {
  return <article className="group border border-navy/10 bg-white p-4 shadow-[0_8px_24px_rgba(16,38,51,.05)] transition-transform duration-300 hover:-translate-y-1"><div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#edf7f6]"><div className="absolute h-48 w-48 rounded-full border border-teal/15" /><div className="relative flex h-28 w-24 flex-col justify-end border border-navy/15 bg-white shadow-md"><div className="h-5 w-14 -translate-y-5 self-center border border-navy/20 bg-navy" /><div className="px-3 pb-4"><p className="font-serif text-xl text-navy">AUNEVA</p><p className="mt-1 text-[7px] font-bold tracking-[.15em] text-teal">RESEARCH</p></div></div></div><div className="pt-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-teal">{product.category}</p><h3 className="mt-2 font-serif text-2xl text-ink">{product.name}</h3><div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><FileText className="mt-0.5 shrink-0 text-teal" size={15} />{product.status}</div><Link href="/shop" className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[.1em] text-navy hover:text-teal">View product <ArrowUpRight size={15} /></Link></div></article>;
}
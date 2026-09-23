import Image from "next/image";
import type { ProductFormat } from "@/lib/catalog";

const images: Record<ProductFormat, string> = {
  vials: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
  sprays: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  pens: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80",
  capsules: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
};

export function CatalogProductVisual({ format, className = "" }: { format: ProductFormat; className?: string }) {
  return <div className={`relative overflow-hidden bg-teal-50 ${className}`}>
    <Image src={images[format]} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-navy/55 to-transparent" />
    <p className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[.14em] text-white">Generic laboratory visual</p>
  </div>;
}
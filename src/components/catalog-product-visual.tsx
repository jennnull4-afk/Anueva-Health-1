import Image from "next/image";
import type { ProductFormat } from "@/lib/catalog";

const images: Record<ProductFormat, string> = {
  vials: "/vial.svg.png",
  sprays: "/spray.svg.png",
  pens: "/pen.svg",
  capsules: "/capsule.svg",
};

export function CatalogProductVisual({ format, className = "" }: { format: ProductFormat; className?: string }) {
  return <div className={`relative overflow-hidden bg-teal-50 ${className}`}>
    <Image src={images[format]} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-navy/55 to-transparent" />
    <p className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[.14em] text-white">Generic laboratory visual</p>
  </div>;
}
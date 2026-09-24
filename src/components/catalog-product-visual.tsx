import Image from "next/image";
import type { ProductFormat } from "@/lib/catalog";

const images: Record<ProductFormat, string> = {
  vials: "/vial.svg.png",
  sprays: "/spray.svg.png",
  pens: "/pen.svg.png",
  capsules: "/capsule.svg",
};

export function CatalogProductVisual({ format, className = "" }: { format: ProductFormat; className?: string }) {
  return <div className={`relative overflow-hidden bg-teal-50 ${className}`}>
    <Image src={images[format]} alt={`Representative ${format.slice(0, -1)} product format`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-contain p-6" />
    <p className="absolute bottom-3 left-4 text-[9px] font-bold uppercase tracking-[.12em] text-navy/70">Format reference image</p>
  </div>;
}
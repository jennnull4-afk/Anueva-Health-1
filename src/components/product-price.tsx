type ProductPriceProps = {
  retailPrice: number;
  salePrice?: number;
  saleDiscountPercent?: number;
  currency: string;
  quantity?: number;
  className?: string;
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function ProductPrice({ retailPrice, salePrice, saleDiscountPercent, currency, quantity = 1, className = "" }: ProductPriceProps) {
  const regularTotal = Math.round((retailPrice * quantity + Number.EPSILON) * 100) / 100;
  const saleTotal = salePrice === undefined ? undefined : Math.round((salePrice * quantity + Number.EPSILON) * 100) / 100;
  if (saleTotal === undefined || saleDiscountPercent === undefined) return <p className={className}>{money(regularTotal, currency)}</p>;
  return <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}><s className="text-base font-medium text-slate-500">{money(regularTotal, currency)}</s><span className="text-xl font-semibold text-navy">{money(saleTotal, currency)}</span><span className="bg-teal px-2 py-1 text-[10px] font-bold tracking-[.08em] text-white">{saleDiscountPercent}% OFF</span></div>;
}
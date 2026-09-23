import { getAunevaCatalog } from "@/lib/catalog";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ids?: unknown };
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids.filter((id): id is string => typeof id === "string"))].slice(0, 100) : [];
    if (ids.length === 0) return Response.json({ products: [] }, { headers: { "Cache-Control": "no-store" } });
    const catalog = await getAunevaCatalog();
    if (catalog.error) return Response.json({ message: "Catalog is unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    const products = catalog.products.filter((product) => ids.includes(product.id)).map(({ id, retailPrice, salePrice, saleDiscountPercent, currency }) => ({ id, retailPrice, salePrice, saleDiscountPercent, currency }));
    return Response.json({ products }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ message: "Invalid price request." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
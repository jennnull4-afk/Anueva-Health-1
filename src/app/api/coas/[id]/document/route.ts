import { privateCoaDocument } from "@/lib/coa";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const document = await privateCoaDocument((await params).id);
  if (!document) return new Response("Certificate document not found.", { status: 404 });
  return new Response(document.body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=certificate-of-analysis.pdf", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
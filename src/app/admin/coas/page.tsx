import { redirect } from "next/navigation";
import { AdminCoaConsole } from "@/components/admin-coa-console";
import { coaAdminConfigured, getAllCoas, getCoaRequests, isCoaAdmin } from "@/lib/coa";
import { getAunevaCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CoaAdminPage() {
  if (!coaAdminConfigured() || !await isCoaAdmin()) redirect("/admin/coas/login");
  const [catalog, records, requests] = await Promise.all([getAunevaCatalog(), getAllCoas(), getCoaRequests()]);
  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-10"><AdminCoaConsole products={catalog.products} records={records} requests={requests} /></main>;
}
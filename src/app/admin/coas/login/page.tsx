import { redirect } from "next/navigation";
import { coaAdminConfigured, isCoaAdmin } from "@/lib/coa";
import { AdminLoginForm } from "@/components/admin-login-form";

export const dynamic = "force-dynamic";

export default async function CoaAdminLoginPage() {
  if (await isCoaAdmin()) redirect("/admin/coas");
  const configured = coaAdminConfigured();
  return <main className="mx-auto min-h-screen max-w-md px-6 py-20"><p className="eyebrow">Staff area</p><h1 className="mt-3 text-3xl">COA administration</h1>{configured ? <AdminLoginForm /> : <p className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Staff access is disabled. Set the server-only <code>AUNEVA_COA_ADMIN_TOKEN</code> environment variable, then redeploy or restart the application.</p>}</main>;
}
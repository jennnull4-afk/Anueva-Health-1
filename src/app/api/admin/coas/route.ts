import { createCoa, isCoaAdmin, updateCoaStatus, type CoaStatus } from "@/lib/coa";
import { isSameOriginRequest } from "@/lib/request-security";

function forbidden() { return Response.json({ message: "Staff authorization required." }, { status: 403 }); }

export async function POST(request: Request) {
  if (!isSameOriginRequest(request) || !await isCoaAdmin()) return forbidden();
  try { return Response.json(await createCoa(await request.formData()), { status: 201 }); }
  catch (error) { return Response.json({ message: error instanceof Error ? error.message : "Unable to save COA." }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request) || !await isCoaAdmin()) return forbidden();
  try {
    const body = await request.json() as { id?: string; status?: CoaStatus };
    if (!body.id || !body.status) throw new Error("Record and status are required.");
    return Response.json(await updateCoaStatus(body.id, body.status));
  } catch (error) { return Response.json({ message: error instanceof Error ? error.message : "Unable to update COA." }, { status: 400 }); }
}
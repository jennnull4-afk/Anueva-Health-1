import { createCoaRequest } from "@/lib/coa";
import { clientIdentifier, consumeRateLimit, isSameOriginRequest } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ message: "Invalid request origin." }, { status: 403 });
  if (!consumeRateLimit(`coa-request:${await clientIdentifier()}`, 5, 60 * 60_000)) return Response.json({ message: "Too many requests. Please try again later." }, { status: 429 });
  try {
    const record = await createCoaRequest(await request.json() as Record<string, unknown>);
    return Response.json({ id: record.id }, { status: 201 });
  } catch (error) { return Response.json({ message: error instanceof Error ? error.message : "Unable to submit this request." }, { status: 400 }); }
}
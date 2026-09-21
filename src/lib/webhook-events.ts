import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface PrymaLabWebhookLog { deliveryId: string; event: string; orderId?: string; prymalabStatus?: string; receivedAt: string; outcome: "processed" | "ignored"; }
const eventsPath = path.join(process.cwd(), "data", "prymalab-webhooks.json");

async function readEvents(): Promise<PrymaLabWebhookLog[]> { try { return JSON.parse(await readFile(eventsPath, "utf8")) as PrymaLabWebhookLog[]; } catch { return []; } }
async function saveEvents(events: PrymaLabWebhookLog[]) { await mkdir(path.dirname(eventsPath), { recursive: true }); const temporaryPath = `${eventsPath}.tmp`; await writeFile(temporaryPath, `${JSON.stringify(events, null, 2)}\n`, "utf8"); await rename(temporaryPath, eventsPath); }

export async function hasProcessedWebhook(deliveryId: string) { return (await readEvents()).some((event) => event.deliveryId === deliveryId); }
export async function logWebhookEvent(event: PrymaLabWebhookLog) { const events = await readEvents(); events.unshift(event); await saveEvents(events.slice(0, 500)); }
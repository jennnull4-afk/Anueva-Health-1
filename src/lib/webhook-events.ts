import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";

export interface PrymaLabWebhookLog { deliveryId: string; event: string; orderId?: string; prymalabStatus?: string; receivedAt: string; outcome: "processed" | "ignored"; }
const eventsPath = path.join(process.cwd(), "data", "prymalab-webhooks.json");
const eventsRedisKey = "auneva:prymalab-webhooks";
const isVercelDeployment = process.env.VERCEL === "1";

function redis() {
	if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
		throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured for Vercel deployments.");
	}
	return Redis.fromEnv();
}

async function readEvents(): Promise<PrymaLabWebhookLog[]> {
	if (isVercelDeployment) return (await redis().get<PrymaLabWebhookLog[]>(eventsRedisKey)) ?? [];
	try { return JSON.parse(await readFile(eventsPath, "utf8")) as PrymaLabWebhookLog[]; } catch { return []; }
}

async function saveEvents(events: PrymaLabWebhookLog[]) {
	if (isVercelDeployment) {
		await redis().set(eventsRedisKey, events);
		return;
	}
	await mkdir(path.dirname(eventsPath), { recursive: true });
	const temporaryPath = `${eventsPath}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(events, null, 2)}\n`, "utf8");
	await rename(temporaryPath, eventsPath);
}

export async function hasProcessedWebhook(deliveryId: string) { return (await readEvents()).some((event) => event.deliveryId === deliveryId); }
export async function logWebhookEvent(event: PrymaLabWebhookLog) { const events = await readEvents(); events.unshift(event); await saveEvents(events.slice(0, 500)); }
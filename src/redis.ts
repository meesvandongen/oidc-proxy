import Elysia from "elysia";
import { Redis } from "ioredis";
import type { RedisOptions } from "ioredis/built/index";
import type { OIDCClientSession } from "./types";

export const redis = (options?: RedisOptions) => {
	const instance = new Redis({
		port: 6379,
		host: "127.0.0.1",
		...options,
	});

	async function get(sessionId: string): Promise<OIDCClientSession | null> {
		const jsonStr = await instance.get(sessionId);
		if (!jsonStr) {
			return null;
		}
		const jsonObj = JSON.parse(jsonStr);
		jsonObj.sessionId = sessionId;
		return jsonObj as OIDCClientSession;
	}

	async function set(session: OIDCClientSession): Promise<void> {
		const { sessionId, ...payload } = session;
		await instance.set(
			sessionId,
			JSON.stringify(payload),
			"PXAT",
			payload.sessionExpiresAt,
		);
	}

	async function del(sessionId: string): Promise<void> {
		await instance.del(sessionId);
	}

	const eRedis: ERedis = {
		get,
		set,
		del,
	};

	return new Elysia().decorate("redis", eRedis);
};

export interface ERedis {
	get(sessionId: string): Promise<OIDCClientSession | null>;
	set(session: OIDCClientSession): Promise<void>;
	del(sessionId: string): Promise<void>;
}

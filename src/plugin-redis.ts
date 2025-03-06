import Elysia from "elysia";
import { type RedisOptions, Redis as _Redis } from "ioredis";
import type { OIDCClientSession } from "./types";

export function pluginRedis(options?: RedisOptions) {
	const instance = new _Redis({
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

	const elysiaRedis: Redis = {
		get,
		set,
		del,
	};

	return new Elysia({
		name: "redis",
	}).decorate("redis", elysiaRedis);
}

export interface Redis {
	get(sessionId: string): Promise<OIDCClientSession | null>;
	set(session: OIDCClientSession): Promise<void>;
	del(sessionId: string): Promise<void>;
}

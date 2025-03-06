import type { Cookie } from "elysia";
import type { Redis } from "../plugin-redis.js";
import type { OIDCClientActiveSession } from "../types.js";

export async function handleErrorResponse(
	e: unknown,
	redis: Redis,
	session: OIDCClientActiveSession | null,
	cookie: Cookie<string | undefined>,
): Promise<Response> {
	if (session) {
		await redis.del(session.sessionId);
	}
	cookie.remove();

	if (e instanceof Error) {
		return new Response(null, { status: 401 });
	}
	return new Response(null, { status: 500 });
}

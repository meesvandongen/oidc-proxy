import type { Redis } from "../plugin-redis";
import type { OIDCClientActiveSession } from "../types";

export async function fetchSession(
	redis: Redis,
	sessionId: string,
): Promise<OIDCClientActiveSession | null> {
	const currentSession = await redis.get(sessionId);
	if (!currentSession) {
		return null;
	}

	const { sessionExpiresAt, codeVerifier, idToken, accessToken } =
		currentSession;

	if (sessionExpiresAt < Date.now()) {
		await redis.del(sessionId);
		return null;
	}

	const hasHash = Boolean(codeVerifier);
	const hasToken = Boolean(idToken && accessToken);

	if (hasHash === hasToken) {
		await redis.del(sessionId);
		return null;
	}

	return currentSession as OIDCClientActiveSession;
}

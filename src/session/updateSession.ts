import type {
	TokenEndpointResponse,
	TokenEndpointResponseHelpers,
} from "openid-client";
import type { Options } from "../options";
import type { Redis } from "../plugin-redis";
import type { OIDCClientActiveSession } from "../types";

export async function updateSession(
	options: Options,
	redis: Redis,
	sessionId: string,
	tokenSet: TokenEndpointResponse & TokenEndpointResponseHelpers,
): Promise<OIDCClientActiveSession | null> {
	try {
		if (tokenSet.expiresIn() === 0) {
			await redis.del(sessionId);
			return null;
		}
		const { id_token, access_token, refresh_token } = tokenSet;
		if (!id_token || !access_token) {
			await redis.del(sessionId);
			return null;
		}
		const newSession: OIDCClientActiveSession = {
			sessionId,
			sessionExpiresAt:
				Date.now() + (options.refreshExpiration ?? 60 * 60 * 24 * 30 * 1000),
			idToken: id_token,
			accessToken: access_token,
			refreshToken: refresh_token,
			codeVerifier: undefined,
			state: undefined,
			nonce: undefined,
		};
		await redis.set(newSession);
		return newSession;
	} catch (e: unknown) {
		return null;
	}
}

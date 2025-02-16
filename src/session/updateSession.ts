import type {
	TokenEndpointResponse,
	TokenEndpointResponseHelpers,
} from "openid-client";
import type { ERedis } from "../redis";
import type { OIDCClientActiveSession } from "../types";

export async function updateSession(
	redis: ERedis,
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
			sessionExpiresAt: Date.now() + refreshExpiration,
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

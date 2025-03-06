import Elysia, { t } from "elysia";
import { type Configuration, authorizationCodeGrant } from "openid-client";
import type { Options } from "../options";
import { pluginRedis } from "../plugin-redis";
import { fetchSession } from "../session/fetchSession";
import { updateSession } from "../session/updateSession";
import { extendCookieExpiration } from "../utils/extendCookieExpiration";
import { handleErrorResponse } from "../utils/handleErrorResponse";

export function callback(openidConfig: Configuration, options: Options) {
	return new Elysia().use(pluginRedis()).get(
		"/callback",
		async ({ cookie: { session_id }, redis, redirect, request }) => {
			const sessionId = session_id.value;
			if (!sessionId) {
				return null;
			}

			const pendingSession = await fetchSession(redis, sessionId);

			try {
				if (!pendingSession) {
					throw new Error("Session data does not exist");
				}

				const { sessionId, codeVerifier, state, nonce } = pendingSession;

				if (!codeVerifier || !state || !nonce) {
					throw new Error("Hash generation failure");
				}

				const tokenSet = await authorizationCodeGrant(
					openidConfig,
					new URL(request.url),
					{
						pkceCodeVerifier: codeVerifier,
					},
				);

				const newSession = await updateSession(
					options,
					redis,
					sessionId,
					tokenSet,
				);
				if (!newSession) {
					session_id.remove();
					throw new Error("Session update failed");
				}

				extendCookieExpiration(options, session_id);

				return redirect(options.postCallbackRedirectUrl, 302);
			} catch (e: unknown) {
				return handleErrorResponse(e, redis, pendingSession, session_id);
			}
		},
		{
			cookie: t.Cookie({
				session_id: t.Optional(t.String()),
			}),
		},
	);
}

import Elysia, { t } from "elysia";
import { type Configuration, buildEndSessionUrl } from "openid-client";
import type { Options } from "../options";
import { pluginRedis } from "../plugin-redis";
import { fetchSession } from "../session/fetchSession";
import { handleErrorResponse } from "../utils/handleErrorResponse";

export function logout(openidConfig: Configuration, options: Options) {
	return new Elysia().use(pluginRedis()).get(
		"/logout",
		async ({ cookie: { session_id }, redis, redirect }) => {
			const sessionId = session_id.value;
			// Existence of Cookie
			if (!sessionId) {
				return null;
			}

			const session = await fetchSession(redis, sessionId);

			try {
				if (!session) {
					throw new Error("Session data does not exist");
				}

				await redis.del(sessionId);
				session_id.remove();

				const parameters: Record<string, string> = {
					post_logout_redirect_uri: options.postLogoutRedirectUrl,
				};

				if (session.idToken) {
					parameters.id_token_hint = session.idToken;
				}

				const endSessionUrl = buildEndSessionUrl(openidConfig, parameters);

				return redirect(endSessionUrl.href, 302);
			} catch (e: unknown) {
				return handleErrorResponse(e, redis, session, session_id);
			}
		},
		{
			cookie: t.Cookie({
				session_id: t.Optional(t.String()),
			}),
		},
	);
}

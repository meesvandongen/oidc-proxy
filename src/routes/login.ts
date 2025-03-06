import Elysia, { t } from "elysia";
import { calculatePKCECodeChallenge } from "oauth4webapi";
import {
	type Configuration,
	buildAuthorizationUrl,
	randomPKCECodeVerifier,
	randomState,
} from "openid-client";
import type { Options } from "../options";
import { pluginRedis } from "../plugin-redis";
import { handleErrorResponse } from "../utils/handleErrorResponse";

export function login(openidConfig: Configuration, options: Options) {
	return new Elysia().use(pluginRedis()).post(
		"/login",
		async ({ redirect, cookie: { session_id }, redis }) => {
			try {
				const codeVerifier = randomPKCECodeVerifier();
				const code_challenge = await calculatePKCECodeChallenge(codeVerifier);

				// We do not need state or nonce, since we are already using PKCE.
				const parameters: Record<string, string> = {
					redirect_uri: `${options.baseUrl}/oauth2/callback`,
					scope: options.scopes.join(" "),
					code_challenge,
					code_challenge_method: "S256",
				};

				const authorizationUrl = buildAuthorizationUrl(
					openidConfig,
					parameters,
				);

				// we just need a random enough session ID, so we re-use the state generator.
				const sessionId = randomState();
				const now = Date.now();

				await redis.set({
					sessionId,
					sessionExpiresAt: now + (options.loginExpiration ?? 60000),
					codeVerifier,
				});

				session_id.set({
					value: sessionId,
					httpOnly: true,
					secure: true,
					sameSite: "lax",
					path: "/",
					expires: new Date(Date.now() + (options.loginExpiration ?? 60000)),
				});

				return redirect(authorizationUrl.href, 302);
			} catch (e: unknown) {
				return handleErrorResponse(e, redis, null, session_id);
			}
		},
		{
			query: t.Object({
				rd: t.Optional(
					t.String({
						description: "redirect to this URL after sign-in",
					}),
				),
			}),
			cookie: t.Cookie({
				session_id: t.Optional(t.String()),
			}),
		},
	);
}

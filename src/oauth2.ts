import Elysia, { t } from "elysia";
import { decodeJwt } from "jose";
import {
	authorizationCodeGrant,
	buildAuthorizationUrl,
	buildEndSessionUrl,
	calculatePKCECodeChallenge,
	discovery,
	fetchUserInfo,
	randomPKCECodeVerifier,
	randomState,
	refreshTokenGrant,
	skipSubjectCheck,
} from "openid-client";
import { getClientAuthentication } from "./client-auth";
import { createOptions } from "./options";
import { redis } from "./redis";
import { fetchSession } from "./session/fetchSession";
import { updateSession } from "./session/updateSession";

export const oauth2 = new Elysia()
	.use(redis())
	.decorate(
		"options",
		createOptions({
			proxy: {
				whitelist_domains: [],
			},
			scopes: [],
			issuer: "",
			clientId: "",
			clientAuth: {
				type: "client_secret_post",
				clientSecret: "",
			},
			loginExpiration: 60_000,
			baseUrl: "http://localhost:3000",
			postCallbackRedirectUrl: "http://localhost:3000",
			postLogoutRedirectUrl: "http://localhost:3000",
			refreshExpiration: 60 * 60 * 24 * 30 * 1000,
		}),
	)
	.derive(async ({ options }) => {
		const issuerUrl = new URL(options.issuer);

		// TODO Do discovery for multiple clients
		const openidConfig = await discovery(
			issuerUrl,
			options.clientId,
			{},
			await getClientAuthentication(options),
		);

		return {
			openidConfig,
		};
	})
	.post(
		"/login",
		async ({
			redirect,
			cookie: { session_id },
			redis,
			options,
			openidConfig,
		}) => {
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
					sessionExpiresAt: now + (options.loginExpiration ?? 60_000),
					codeVerifier,
				});

				session_id.set({
					value: sessionId,
					httpOnly: true,
					secure: true,
					sameSite: "lax",
					path: "/",
					expires: new Date(Date.now() + (options.loginExpiration ?? 60_000)),
				});

				return redirect(authorizationUrl.href, 302);
			} catch (e: unknown) {
				return handleErrorResponse(e, null, this, session_id);
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
	)
	.get(
		"/logout",
		async ({
			cookie: { session_id },
			redis,
			openidConfig,
			redirect,
			options,
		}) => {
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
				return handleErrorResponse(e, session, this, session_id);
			}
		},
		{
			cookie: t.Cookie({
				session_id: t.Optional(t.String()),
			}),
		},
	)
	.get(
		"/callback",
		async ({
			cookie: { session_id },
			redis,
			openidConfig,
			redirect,
			options,
			request,
		}) => {
			const sessionId = session_id.value;
			// Existence of Cookie
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

				const newSession = await updateSession(redis, sessionId, tokenSet);
				if (!newSession) {
					session_id.remove();
					throw new Error("Session update failed");
				}

				if (options.loginExpiration !== 0) {
					session_id.update({
						httpOnly: true,
						secure: true,
						sameSite: "lax",
						path: "/",
						expires: new Date(
							Date.now() +
								(options.refreshExpiration ?? 60 * 60 * 24 * 30 * 1000),
						),
					});
				}

				return redirect(options.postCallbackRedirectUrl, 302);
			} catch (e: unknown) {
				return handleErrorResponse(e, pendingSession, this, cookie);
			}
		},
		{
			cookie: t.Cookie({
				session_id: t.Optional(t.String()),
			}),
		},
	)
	.guard(
		{
			cookie: t.Cookie({
				session_id: t.Optional(t.String()),
			}),
		},
		(app) =>
			app
				.resolve(
					async ({
						headers: { authorization },
						cookie: { session_id },
						error,
						redis,
						openidConfig,
						options,
					}) => {
						const sessionId = session_id.value;
						if (!sessionId) {
							session_id.remove();
							throw error(401);
						}

						const staleSession = await fetchSession(redis, sessionId);
						if (!staleSession) {
							session_id.remove();
							throw error(401);
						}

						const { idToken, accessToken, refreshToken } = staleSession;

						if (!idToken || !accessToken) {
							await redis.del(sessionId);
							session_id.remove();
							throw error(401);
						}

						const { iss, exp } = decodeJwt(idToken);
						if (!iss || !exp) {
							await redis.del(sessionId);
							session_id.remove();
							throw error(401);
						}

						// Not expired
						if (exp * 1000 > Date.now()) {
							return {
								session: staleSession,
							};
						}

						if (options.autoRefresh && refreshToken) {
							try {
								const tokenSet = await refreshTokenGrant(
									openidConfig,
									refreshToken,
								);

								const renewedSession = await updateSession(
									redis,
									sessionId,
									tokenSet,
								);

								if (!renewedSession) {
									session_id.remove();
									throw error(401);
								}

								if (options.loginExpiration !== 0) {
									session_id.update({
										httpOnly: true,
										secure: true,
										sameSite: "lax",
										path: "/",
										expires: new Date(
											Date.now() +
												(options.refreshExpiration ?? 60 * 60 * 24 * 30 * 1000),
										),
									});
								}

								return {
									session: renewedSession,
								};
							} catch (e: unknown) {
								await redis.del(sessionId);
								session_id.remove();
								if (e instanceof Error) {
									throw error(401);
								}
								throw error(500);
							}
						}

						await redis.del(sessionId);
						session_id.remove();
						throw error(401);
					},
				)
				.get(
					"/userinfo",
					async ({
						cookie: { session_id },
						redis,
						openidConfig,
						redirect,
						options,
						request,
						session,
						set,
					}) => {
						try {
							const userinfo = await fetchUserInfo(
								openidConfig,
								session.accessToken,
								skipSubjectCheck,
							);

							set.headers["Content-Type"] = "application/json";
							return userinfo;
						} catch (e: unknown) {
							return handleErrorResponse(e, currentSession, this, cookie);
						}
					},
				)
				.get("/auth", async () => {}, {
					response: {
						202: t.String({}),
					},
				}),
	);

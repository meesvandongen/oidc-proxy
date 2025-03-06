import Elysia from "elysia";
import { decodeJwt } from "jose";
import { type Configuration, refreshTokenGrant } from "openid-client";
import type { Options } from "./options";
import { pluginRedis } from "./plugin-redis";
import { fetchSession } from "./session/fetchSession";
import { updateSession } from "./session/updateSession";
import { extendCookieExpiration } from "./utils/extendCookieExpiration";

export const sessionResolver = (
	openidConfig: Configuration,
	options: Options,
) =>
	new Elysia({
		name: "sessionResolver",
	})
		.use(pluginRedis())
		.resolve(
			{
				as: "scoped",
			},
			async ({
				headers: { authorization },
				cookie: { session_id },
				error,
				redis,
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
							options,
							redis,
							sessionId,
							tokenSet,
						);

						if (!renewedSession) {
							session_id.remove();
							throw error(401);
						}

						extendCookieExpiration(options, session_id);

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
		);

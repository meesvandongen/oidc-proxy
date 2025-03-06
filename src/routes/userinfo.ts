import Elysia, { t } from "elysia";
import {
	type Configuration,
	fetchUserInfo,
	skipSubjectCheck,
} from "openid-client";
import type { Options } from "../options";
import { pluginRedis } from "../plugin-redis";
import { sessionResolver } from "../session-resolver";
import { handleErrorResponse } from "../utils/handleErrorResponse";

export function userinfo(openidConfig: Configuration, options: Options) {
	return new Elysia()
		.use(pluginRedis())
		.use(sessionResolver(openidConfig, options))
		.get(
			"/userinfo",
			async ({ cookie: { session_id }, redis, session, set }) => {
				try {
					const userinfo = await fetchUserInfo(
						openidConfig,
						session.accessToken,
						skipSubjectCheck,
					);

					set.headers["Content-Type"] = "application/json";
					return userinfo;
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

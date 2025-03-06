import Elysia, { t } from "elysia";
import type { Configuration } from "openid-client";
import type { Options } from "../options";
import { pluginRedis } from "../plugin-redis";
import { sessionResolver } from "../session-resolver";

export function auth(openidConfig: Configuration, options: Options) {
	return new Elysia()
		.use(pluginRedis())
		.use(sessionResolver(openidConfig, options))
		.get("/auth", async () => {}, {
			response: {
				202: t.String({}),
			},
			cookie: t.Cookie({
				session_id: t.Optional(t.String()),
			}),
		});
}

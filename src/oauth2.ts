import Elysia from "elysia";
import { init } from "./options";
import { pluginRedis } from "./plugin-redis";
import { auth } from "./routes/auth";
import { callback } from "./routes/callback";
import { login } from "./routes/login";
import { logout } from "./routes/logout";
import { userinfo } from "./routes/userinfo";

export async function oauth2() {
	const { openidConfig, options } = await init();

	return new Elysia()
		.use(pluginRedis())
		.use(login(openidConfig, options))
		.use(logout(openidConfig, options))
		.use(callback(openidConfig, options))
		.use(userinfo(openidConfig, options))
		.use(auth(openidConfig, options));
}

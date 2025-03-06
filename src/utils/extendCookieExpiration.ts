import type { Cookie } from "elysia";
import type { Options } from "../options";

export function extendCookieExpiration(
	options: Options,
	cookie: Cookie<string | undefined>,
) {
	if (options.loginExpiration === 0) {
		return;
	}

	cookie.update({
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		path: "/",
		expires: new Date(
			Date.now() + (options.refreshExpiration ?? 60 * 60 * 24 * 30 * 1000),
		),
	});
}

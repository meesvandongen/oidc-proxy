import { describe, expect, mock, test } from "bun:test";
import type { Cookie } from "elysia";
import { extendCookieExpiration } from "./extendCookieExpiration";

describe("extendCookieExpiration", () => {
	test("Succeeded", () => {
		const cookie = {
			value: "value",
			update: mock(),
		} as unknown as Cookie<string | undefined>;

		extendCookieExpiration(
			{
				loginExpiration: 60,
			} as any,
			cookie,
		);

		expect(cookie.update).toHaveBeenCalledWith({
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			path: "/",
			expires: expect.any(Date),
		});
	});

	test("Skip", () => {
		const cookie = {
			session_id: {
				update: mock(),
			},
		} as unknown as Cookie<string | undefined>;

		extendCookieExpiration(
			{
				loginExpiration: 0,
			} as any,
			cookie,
		);

		expect(cookie.update).not.toHaveBeenCalled();
	});
});

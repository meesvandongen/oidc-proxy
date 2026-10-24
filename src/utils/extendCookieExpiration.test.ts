import type { Cookie } from "elysia";
import { describe, expect, test, vi } from "vite-plus/test";
import { extendCookieExpiration } from "./extendCookieExpiration";

describe("extendCookieExpiration", () => {
	test("Succeeded", () => {
		const cookie = {
			value: "value",
			update: vi.fn(),
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
			value: "value",
			update: vi.fn(),
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

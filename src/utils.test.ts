import { describe, expect, it } from "bun:test";

import { bytesToByteString } from "./utils";

describe("bytesToByteString", () => {
	it("should convert an empty Uint8Array to an empty string", () => {
		const input = new Uint8Array([]);
		const result = bytesToByteString(input);
		expect(result).toBe("");
	});

	it("should convert a Uint8Array with one byte to a string with one character", () => {
		const input = new Uint8Array([65]); // ASCII code for 'A'
		const result = bytesToByteString(input);
		expect(result).toBe("A");
	});

	it("should convert a Uint8Array with multiple bytes to a string with corresponding characters", () => {
		const input = new Uint8Array([72, 101, 108, 108, 111]); // ASCII codes for 'Hello'
		const result = bytesToByteString(input);
		expect(result).toBe("Hello");
	});

	it("should handle non-ASCII characters correctly", () => {
		const input = new Uint8Array([195, 164]); // UTF-8 encoding for 'ä'
		const result = bytesToByteString(input);
		expect(result).toBe("ä");
	});
});

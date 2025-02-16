import { describe, expect, it } from "bun:test";
import fc from "fast-check";

import {
	base64UrlToBytes,
	bytesStringToBytes,
	bytesToBase64Url,
	bytesToBytesString,
	decodePayload,
	jsonToBase64Url,
} from "./utils";

describe("bytesToBytesString", () => {
	it("should convert an empty Uint8Array to an empty string", () => {
		const input = new Uint8Array([]);
		const result = bytesToBytesString(input);
		expect(result).toBe("");
	});

	it("should convert a Uint8Array with one byte to a string with one character", () => {
		const input = new Uint8Array([65]); // ASCII code for 'A'
		const result = bytesToBytesString(input);
		expect(result).toBe("A");
	});

	it("should convert a Uint8Array with multiple bytes to a string with corresponding characters", () => {
		const input = new Uint8Array([72, 101, 108, 108, 111]); // ASCII codes for 'Hello'
		const result = bytesToBytesString(input);
		expect(result).toBe("Hello");
	});

	it("should handle non-ASCII characters correctly", () => {
		const input = new Uint8Array([195, 164]); // UTF-8 encoding for 'ä'
		const result = bytesToBytesString(input);
		expect(result).toBe("ä");
	});
});

describe("bytesStringToBytes", () => {
	it("should convert an empty string to an empty Uint8Array", () => {
		const input = "";
		const result = bytesStringToBytes(input);
		expect(result).toEqual(new Uint8Array([]));
	});

	it("should convert a string with one character to a Uint8Array with one byte", () => {
		const input = "A";
		const result = bytesStringToBytes(input);
		expect(result).toEqual(new Uint8Array([65])); // ASCII code for 'A'
	});

	it("should convert a string with multiple characters to a Uint8Array with corresponding bytes", () => {
		const input = "Hello";
		const result = bytesStringToBytes(input);
		expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111])); // ASCII codes for 'Hello'
	});
});

describe("bytesToBase64Url", () => {
	it("should convert an empty Uint8Array to an empty base64url string", () => {
		const input = new Uint8Array([]);
		const result = bytesToBase64Url(input);
		expect(result).toBe("");
	});

	it("should convert a Uint8Array to a base64url string", () => {
		const input = new Uint8Array([72, 101, 108, 108, 111]); // ASCII codes for 'Hello'
		const result = bytesToBase64Url(input);
		expect(result).toBe("SGVsbG8");
	});
});

describe("base64UrlToBytes", () => {
	it("should convert an empty base64url string to an empty Uint8Array", () => {
		const input = "";
		const result = base64UrlToBytes(input);
		expect(result).toEqual(new Uint8Array([]));
	});

	it("should convert a base64url string to a Uint8Array", () => {
		const input = "SGVsbG8"; // base64url for 'Hello'
		const result = base64UrlToBytes(input);
		expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111])); // ASCII codes for 'Hello'
	});
});

describe("jsonToBase64Url", () => {
	it("should convert an empty JSON object to an empty base64url string", () => {
		const input = {};
		const result = jsonToBase64Url(input);
		expect(result).toBe("e30");
	});

	it("should convert a JSON object to a base64url string", () => {
		const input = { hello: "world" };
		const result = jsonToBase64Url(input);
		expect(result).toBe("eyJoZWxsbyI6IndvcmxkIn0");
	});
});

describe("decodePayload", () => {
	it("should decode a base64url encoded JSON string", () => {
		const input = "eyJoZWxsbyI6IndvcmxkIn0"; // base64url for '{"hello":"world"}'
		const result = decodePayload(input);
		expect(result).toEqual({ hello: "world" });
	});

	it("should return undefined for an invalid base64url string", () => {
		const input = "invalid_base64url";
		const result = decodePayload(input);
		expect(result).toBeUndefined();
	});
});

describe("bytesToBytesString and bytesStringToBytes", () => {
	fc.assert(
		fc.property(fc.string(), (str) => {
			it(`should convert a string to a Uint8Array and back to the same string: ${str}`, () => {
				const result = bytesToBytesString(bytesStringToBytes(str));
				expect(result).toBe(str);
			});
		}),
	);
});

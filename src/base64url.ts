export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export function encodeBase64(input: Uint8Array) {
	const CHUNK_SIZE = 0x8000;
	const arr = [];
	for (let i = 0; i < input.length; i += CHUNK_SIZE) {
		arr.push(
			// @ts-expect-error
			String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)),
		);
	}
	return btoa(arr.join(""));
}

export function encode(input: Uint8Array) {
	return encodeBase64(input)
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

export function decodeBase64(encoded: string): Uint8Array {
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export function decode(input: string) {
	const encoded = input
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.replace(/\s/g, "");
	try {
		return decodeBase64(encoded);
	} catch {
		throw new TypeError("The input to be decoded is not correctly encoded.");
	}
}

export type KeyUsages = "sign" | "verify";

export function bytesToByteString(bytes: Uint8Array): string {
	let byteStr = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		byteStr += String.fromCharCode(bytes[i]);
	}
	return byteStr;
}

export function byteStringToBytes(byteStr: string): Uint8Array {
	const bytes = new Uint8Array(byteStr.length);
	for (let i = 0; i < byteStr.length; i++) {
		bytes[i] = byteStr.charCodeAt(i);
	}
	return bytes;
}

export function bytesToBase64String(bytes: Uint8Array): string {
	return btoa(bytesToByteString(bytes));
}

export function base64StringToBytes(b64str: string): Uint8Array {
	return byteStringToBytes(atob(b64str));
}

export function textToBytes(str: string): Uint8Array {
	return byteStringToBytes(str);
}

export function bytesToBase64Url(bytes: Uint8Array): string {
	return bytesToBase64String(bytes)
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

export function base64UrlToBytes(b64url: string): Uint8Array {
	return base64StringToBytes(
		b64url.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, ""),
	);
}

export function textToBase64Url(str: string): string {
	const encoder = new TextEncoder();
	const charCodes = encoder.encode(str);
	const binaryStr = String.fromCharCode(...charCodes);

	return btoa(binaryStr)
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

export function jsonToBase64Url(json: Record<string, unknown>): string {
	return textToBase64Url(JSON.stringify(json));
}

export function decodePayload<T = Record<string, unknown>>(
	raw: string,
): T | undefined {
	try {
		const bytes = Array.from(atob(raw), (char) => char.charCodeAt(0));
		const decodedString = new TextDecoder("utf-8").decode(
			new Uint8Array(bytes),
		);

		return JSON.parse(decodedString);
	} catch {
		return;
	}
}

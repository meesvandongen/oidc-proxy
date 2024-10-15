export type KeyUsages = "sign" | "verify";

export function bytesToBytesString(bytes: Uint8Array): string {
	let byteStr = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		byteStr += String.fromCharCode(bytes[i]);
	}
	return byteStr;
}

export function bytesStringToBytes(byteStr: string): Uint8Array {
	const bytes = new Uint8Array(byteStr.length);
	for (let i = 0; i < byteStr.length; i++) {
		bytes[i] = byteStr.charCodeAt(i);
	}
	return bytes;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
	return textToBase64Url(bytesToBytesString(bytes));
}

export function base64UrlToBytes(b64url: string): Uint8Array {
	return bytesStringToBytes(atob(base64UrlToBase64(b64url)));
}

function textToBase64Url(str: string): string {
	return base64ToBase64Url(btoa(str));
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

function base64UrlToBase64(b64url: string): string {
	return b64url.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
}

function base64ToBase64Url(b64: string): string {
	return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

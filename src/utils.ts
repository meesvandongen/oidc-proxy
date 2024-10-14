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

export function arrayBufferToBase64String(
	arrayBuffer: ArrayBufferLike,
): string {
	return btoa(bytesToByteString(new Uint8Array(arrayBuffer)));
}

export function base64StringToArrayBuffer(b64str: string): BufferSource {
	return byteStringToBytes(atob(b64str)).buffer;
}

export function textToArrayBuffer(str: string): Uint8Array {
	return byteStringToBytes(str);
}

export function arrayBufferToBase64Url(arrayBuffer: ArrayBufferLike): string {
	return arrayBufferToBase64String(arrayBuffer)
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

export function base64UrlToArrayBuffer(b64url: string): BufferSource {
	return base64StringToArrayBuffer(
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

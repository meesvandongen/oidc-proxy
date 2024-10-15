import {
	base64UrlToBytes,
	bytesStringToBytes,
	bytesToBase64Url,
	decodePayload,
	jsonToBase64Url,
} from "./utils";

const algorithms = {
	ES256: { name: "ECDSA", namedCurve: "P-256", hash: "SHA-256" },
	ES384: { name: "ECDSA", namedCurve: "P-384", hash: "SHA-384" },
	ES512: { name: "ECDSA", namedCurve: "P-521", hash: "SHA-512" },
	HS256: { name: "HMAC", hash: "SHA-256" },
	HS384: { name: "HMAC", hash: "SHA-384" },
	HS512: { name: "HMAC", hash: "SHA-512" },
	RS256: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
	RS384: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-384" },
	RS512: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-512" },
};

export type JwtAlgorithm = keyof typeof algorithms;

export interface JwtHeader {
	typ: "JWT";
	alg: JwtAlgorithm;
}

export type JwtPayload<T = Record<string, unknown>> = {
	/** Issuer */
	iss: string;

	/** Subject */
	sub?: string;

	/** Audience */
	aud?: string | string[];

	/** Expiration Time */
	exp?: number;

	/** Not Before */
	nbf?: number;

	/** Issued At */
	iat?: number;

	/** JWT ID */
	jti?: string;
} & T;

export interface JwtData<Payload = Record<string, unknown>> {
	header?: JwtHeader;
	payload?: JwtPayload<Payload>;
}

/**
 * Signs a payload and returns the token
 */
export async function sign<Payload = Record<string, unknown>>(
	payload: JwtPayload<Payload>,
	jwk: JsonWebKey,
	alg: JwtAlgorithm = "HS256",
): Promise<string> {
	const headerString = jsonToBase64Url({
		typ: "JWT",
		alg,
	});

	const timestamp = Math.floor(Date.now() / 1000);
	const payloadString = jsonToBase64Url({
		iat: timestamp,
		exp: timestamp + 3600,
		nbf: timestamp - 10,
		...payload,
	});

	const partialToken = `${headerString}.${payloadString}`;

	const algorithm = algorithms[alg];

	const key = await crypto.subtle.importKey("jwk", jwk, algorithm, true, [
		"sign",
	]);

	const signed = await crypto.subtle.sign(
		algorithm,
		key,
		bytesStringToBytes(partialToken),
	);

	return `${partialToken}.${bytesToBase64Url(new Uint8Array(signed))}`;
}

/**
 * Verifies the integrity of the token and returns a boolean value.
 */
export async function verify<Payload = Record<string, unknown>>(
	token: string,
	jwk: JsonWebKey,
	alg: JwtAlgorithm = "HS256",
): Promise<JwtData<Payload>> {
	const tokenParts = token.split(".");

	if (tokenParts.length !== 3) {
		throw new Error("token must consist of 3 parts");
	}

	const algorithm = algorithms[alg];

	const decodedToken = decode<Payload>(token);

	if (decodedToken.header?.alg !== alg) {
		throw new Error("INVALID_SIGNATURE");
	}

	if (decodedToken.payload) {
		const now = Math.floor(Date.now() / 1000);

		if (
			decodedToken.payload.nbf &&
			decodedToken.payload.nbf > now &&
			decodedToken.payload.nbf - now > 0
		) {
			throw new Error("NOT_YET_VALID");
		}

		if (
			decodedToken.payload.exp &&
			decodedToken.payload.exp <= now &&
			now - decodedToken.payload.exp > 0
		) {
			throw new Error("EXPIRED");
		}
	}

	const key = await crypto.subtle.importKey("jwk", jwk, algorithm, true, [
		"verify",
	]);

	const isValid = await crypto.subtle.verify(
		algorithm,
		key,
		base64UrlToBytes(tokenParts[2]),
		bytesStringToBytes(`${tokenParts[0]}.${tokenParts[1]}`),
	);

	if (!isValid) {
		throw new Error("INVALID_SIGNATURE");
	}

	return decodedToken;
}

/**
 * Returns the payload **without** verifying the integrity of the token. Please
 * use `verify()` first to keep your application secure!
 */
export function decode<Payload = Record<string, unknown>>(
	token: string,
): JwtData<Payload> {
	return {
		header: decodePayload<JwtHeader>(
			token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/"),
		),
		payload: decodePayload<JwtPayload<Payload>>(
			token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
		),
	};
}

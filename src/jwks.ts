const { privateKey, publicKey } = await crypto.subtle.generateKey(
	{
		name: "RSA-PSS",
		modulusLength: 2048,
		publicExponent: new Uint8Array([1, 0, 1]),
		hash: "SHA-256",
	},
	true,
	["sign", "verify"],
);

export const publicJwk = await crypto.subtle.exportKey("jwk", publicKey);
export const privateJwk = await crypto.subtle.exportKey("jwk", privateKey);

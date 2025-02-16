import { importJWK } from "jose";
import {
	ClientSecretJwt,
	ClientSecretPost,
	type PrivateKey,
	PrivateKeyJwt,
} from "openid-client";
import type { Options } from "./options";

export async function getClientAuthentication(options: Options) {
	if (options.clientAuth.type === "private_key_jwt") {
		const key = await importJWK<CryptoKey>(
			JSON.parse(options.clientAuth.privateKey),
			options.clientAuth.alg,
		);
		if (!("type" in key)) {
			throw new Error();
		}

		return PrivateKeyJwt(key);
	}
	if (options.clientAuth.type === "client_secret_jwt") {
		return ClientSecretJwt(options.clientAuth.clientSecret);
	}
	return ClientSecretPost(options.clientAuth.clientSecret);
}

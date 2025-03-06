import { Value } from "@sinclair/typebox/value";
import { type Static, t } from "elysia";
import { importJWK } from "jose";
import {
	ClientSecretJwt,
	ClientSecretPost,
	PrivateKeyJwt,
	discovery,
} from "openid-client";

export const optionsScheme = t.Object({
	proxy: t.Object({
		whitelist_domains: t.Array(t.String(), {
			description:
				"allowed domains for redirection after authentication. Prefix domain with a . or a *. to allow subdomains (e.g. .example.com, *.example.com)",
		}),
	}),
	scopes: t.Array(t.String(), {
		description: "list of scopes to request",
	}),
	issuer: t.String({
		description: "OpenID Connect issuer URL",
	}),
	clientId: t.String({
		description: "OAuth2 client ID",
	}),
	clientAuth: t.Union([
		t.Object({
			type: t.Literal("client_secret_post"),
			clientSecret: t.String(),
		}),
		t.Object({
			type: t.Literal("private_key_jwt"),
			privateKey: t.String(),
			alg: t.Optional(
				t.String({
					description:
						"If the JWK does not contain an alg field, this field must be present.",
				}),
			),
		}),
		t.Object({
			type: t.Literal("client_secret_jwt"),
			clientSecret: t.String(),
		}),
	]),
	loginExpiration: t.Optional(
		t.Number({
			description: "time in milliseconds until a login session expires",
			default: 60_000,
		}),
	),
	refreshExpiration: t.Optional(
		t.Number({
			description: "time in milliseconds until a refresh token expires",
			default: 2_592_000_000,
		}),
	),
	baseUrl: t.String({
		description: "OAuth server base url, without trailing slash",
		examples: ["https://api.example.com"],
	}),
	postLogoutRedirectUrl: t.String({
		description: "URL to redirect to after logout",
	}),
	postCallbackRedirectUrl: t.String({
		description: "URL to redirect to after callback",
	}),
	autoRefresh: t.Optional(
		t.Boolean({
			description: "Automatically refresh tokens",
			default: true,
		}),
	),
});

export type Options = Static<typeof optionsScheme>;

export async function init() {
	const options: Options = {
		proxy: {
			whitelist_domains: [],
		},
		scopes: [],
		issuer: "",
		clientId: "",
		clientAuth: {
			type: "client_secret_post",
			clientSecret: "",
		},
		loginExpiration: 60_000,
		baseUrl: "http://localhost:3000",
		postCallbackRedirectUrl: "http://localhost:3000",
		postLogoutRedirectUrl: "http://localhost:3000",
		refreshExpiration: 60 * 60 * 24 * 30 * 1000,
	};

	Value.Assert(optionsScheme, options);

	const issuerUrl = new URL(options.issuer);

	// TODO Do discovery for multiple clients
	const openidConfig = await discovery(
		issuerUrl,
		options.clientId,
		{},
		await getClientAuthentication(options),
	);

	return {
		openidConfig,
		options,
	};
}

async function getClientAuthentication(options: Options) {
	if (options.clientAuth.type === "private_key_jwt") {
		const key = await importJWK(
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

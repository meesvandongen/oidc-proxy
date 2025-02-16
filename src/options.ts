import { Value } from "@sinclair/typebox/value";
import { type Static, t } from "elysia";

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

export function createOptions(options: Options): Options {
	Value.Assert(optionsScheme, options);
	return options;
}

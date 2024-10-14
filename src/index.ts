import { Elysia, t } from "elysia";
import { publicJwk } from "./jwks";

const endpoints = {
	wellKnownDocument: "/.well-known/openid-configuration",
	token: "/token",
	jwks: "/jwks",
	authorize: "/authorize",
	userinfo: "/userinfo",
	revoke: "/revoke",
	endSession: "/endsession",
	introspect: "/introspect",
};

const issuer = "http://localhost:3000";

const app = new Elysia()
	.get(endpoints.wellKnownDocument, ({ server }) => ({
		issuer: issuer,
		token_endpoint: `${issuer}/${endpoints.token}`,
		authorization_endpoint: `${issuer}${endpoints.authorize}`,
		userinfo_endpoint: `${issuer}${endpoints.userinfo}`,
		token_endpoint_auth_methods_supported: ["none"],
		jwks_uri: `${issuer}${endpoints.jwks}`,
		response_types_supported: ["code"],
		grant_types_supported: [
			"client_credentials",
			"authorization_code",
			"password",
			"refresh_token",
		],
		token_endpoint_auth_signing_alg_values_supported: ["RS256"],
		response_modes_supported: ["query"],
		id_token_signing_alg_values_supported: ["RS256"],
		revocation_endpoint: `${issuer}${endpoints.revoke}`,
		subject_types_supported: ["public"],
		end_session_endpoint: `${issuer}${endpoints.endSession}`,
		introspection_endpoint: `${issuer}${endpoints.introspect}`,
	}))
	.get(endpoints.jwks, () => ({
		keys: [publicJwk],
	}))
	.post(endpoints.token, ({ body }) => {
    switch(body.grant_type) {
      case "authorization_code":
        return {
          access
    }

    return {}
  }, {
		body: t.Object({
			scope: t.Optional(t.String()),
			grant_type: t.String(),
			client_id: t.Optional(t.String()),
			code: t.Optional(t.String()),
			aud: t.Optional(t.Union([t.String(), t.Array(t.String())])),
		}),
	})
	.listen(3000);

console.log(
	`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

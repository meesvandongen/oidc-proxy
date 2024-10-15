import { describe, expect, it } from "bun:test";
import fc from "fast-check";
import { type JwtAlgorithm, sign, verify } from "./jwt";

describe("sign", () => {
	const cases: {
		signJwk: JsonWebKey;
		verifyJwk: JsonWebKey;
		algs: JwtAlgorithm[];
	}[] = [
		{
			signJwk: {
				kty: "oct",
				k: "s3cr3tK3y1",
			},
			verifyJwk: {
				kty: "oct",
				k: "s3cr3tK3y1",
			},
			algs: ["HS256", "HS384", "HS512"],
		},
		{
			signJwk: {
				p: "9O1ZvlhCuO-lYaP9Hrcw9kqLJ6lJcCT5ki3KOE7untM-GLhvwZCM8YkUeuTYNr8EE7B98v4X13cgBFWZqOiE5w",
				kty: "RSA",
				q: "hkqDzZn3ZmDYRbmxhOIE8LnFZZSAycCl1tUwWaKho9nB_-GAz8GOgyZNPQGCOt9bqitaZAxWtFnynL7mgbEQvQ",
				d: "G4pfK2yUTSBNUrXa0ugXTYS_ZxP4PdonmUKJbRfbewfFoRYR9dVKAi8nT6JDLBtyfn-2kPR1x3xf2GhvCwxBcJcn_anvaWJMkiNxpNV3Xb0yJdQwyUxBngz-74aS1BQKXQMsLUSYU6OEah_zLDGlLTkr0jG-qmppgslqQ3q5uwE",
				e: "AQAB",
				qi: "aseQJG2zgUUHFI1IxhRPj2U-enWHQAA1KAaIcqH1cTzutgB15nKy4a3wqAMVpJ4efKwd-VXmsuhpjuaddKqYJA",
				dp: "tx0AfGt2LteUGITHCADDzU777IIHEp3CLMSpLCHvCrU59rdlbhzJEwd-VUbkU0HKJYJNF69aWc-JE1SAFiUIvw",
				dq: "hkKld79BO5gDYeJ_eq1F5y60DhTkldEHfLvz9QnFtT0W2i6oTA3l33VBr4Z8n0OEL6PcYT58yR9Mki3B41QVuQ",
				n: "gHuHr72EQkVK_SRmyvyv64Sb6jGOB1U9AC9ImDlN5vvuFX947Xi1M8ZxG5ULV3JFSKQ_SIK_MnstR-ClYncwWWasSlaJB7YqYDSOO-OszeT5SkCttS3ZkIPIBJV8QRP-84N76nVuii1lkjLk0z4JEZH_CnIsLyYhNDaaRoavjos",
			},
			verifyJwk: {
				kty: "RSA",
				e: "AQAB",
				n: "gHuHr72EQkVK_SRmyvyv64Sb6jGOB1U9AC9ImDlN5vvuFX947Xi1M8ZxG5ULV3JFSKQ_SIK_MnstR-ClYncwWWasSlaJB7YqYDSOO-OszeT5SkCttS3ZkIPIBJV8QRP-84N76nVuii1lkjLk0z4JEZH_CnIsLyYhNDaaRoavjos",
			},
			algs: ["RS256", "RS384", "RS512"],
		},
		{
			signJwk: {
				kty: "EC",
				d: "NOOBITgeJ4N_HFqzUILZgHwm1l2i6C7gZA6S74q9uJM",
				crv: "P-256",
				x: "MiEkRbe2bvD-tKyXcvI06iY-MJSt7SeR1p5xRCqrlxk",
				y: "qaCBvr6a6vj5Ju7_t50R7hrsSvibtm328O9SpQ3gTHY",
			},
			verifyJwk: {
				kty: "EC",
				crv: "P-256",
				x: "MiEkRbe2bvD-tKyXcvI06iY-MJSt7SeR1p5xRCqrlxk",
				y: "qaCBvr6a6vj5Ju7_t50R7hrsSvibtm328O9SpQ3gTHY",
			},
			algs: ["ES256"],
		},
		{
			signJwk: {
				kty: "EC",
				d: "1aqGVID9SoswkMPqVUPEayVhlRC8N9L77HMdmb-9Etat_dz2YuPerP2xX1w7H4qc",
				crv: "P-384",
				x: "M7hzWe_00p3wrvmPnWztnl5WxpIAbgpF1k2DeRL4FYi8S-7x_J6nVV3-s9SvLkAT",
				y: "g8QW6aXoLX2pXZ7r61SFEAwx8YwuOz9bq47TpGdMwKoLLHtOS-EFa1PUGyNjXDZ9",
			},
			verifyJwk: {
				kty: "EC",
				crv: "P-384",
				x: "M7hzWe_00p3wrvmPnWztnl5WxpIAbgpF1k2DeRL4FYi8S-7x_J6nVV3-s9SvLkAT",
				y: "g8QW6aXoLX2pXZ7r61SFEAwx8YwuOz9bq47TpGdMwKoLLHtOS-EFa1PUGyNjXDZ9",
			},
			algs: ["ES384"],
		},
		{
			signJwk: {
				kty: "EC",
				d: "ADyUhTOQOgKTFzN8unc5F3pPXVOLWYBbSKPaT5prqiZZVvmTBKWNg5XR6tPRzBjXTg4KS5JSn939Qt0wr2OThj1n",
				crv: "P-521",
				x: "AXd2RXi_emgUg2ghTvFUD3h34oWjYySuKedB316xobNxyWf9zgBsE37bmLqPryS92wy6wFouMsjbUSggZrbCVmnc",
				y: "AdQ_FJDWh0srTU4PPMQ3E3zcLhk-Ct3F_ScScSOXU4NLWihk4em_2gs_O9h--XYy0oYB-Fh2NMucZBOgcJP8teOj",
			},
			verifyJwk: {
				kty: "EC",
				crv: "P-521",
				x: "AXd2RXi_emgUg2ghTvFUD3h34oWjYySuKedB316xobNxyWf9zgBsE37bmLqPryS92wy6wFouMsjbUSggZrbCVmnc",
				y: "AdQ_FJDWh0srTU4PPMQ3E3zcLhk-Ct3F_ScScSOXU4NLWihk4em_2gs_O9h--XYy0oYB-Fh2NMucZBOgcJP8teOj",
			},
			algs: ["ES512"],
		},
	];

	for (const { signJwk, algs, verifyJwk } of cases) {
		for (const alg of algs) {
			it(`should sign and verify a token using ${alg}`, async () => {
				const payload = {
					sub: "1234567890",
					name: "John Doe",
					admin: true,
					iss: "https://example.com",
				};
				const token = await sign(payload, signJwk, alg);
				const decoded = await verify(token, verifyJwk, alg);
				expect(decoded.payload).toMatchObject(payload);
			});
		}
	}
});

describe("sign and verify", () => {
	const signJwk = {
		p: "9O1ZvlhCuO-lYaP9Hrcw9kqLJ6lJcCT5ki3KOE7untM-GLhvwZCM8YkUeuTYNr8EE7B98v4X13cgBFWZqOiE5w",
		kty: "RSA",
		q: "hkqDzZn3ZmDYRbmxhOIE8LnFZZSAycCl1tUwWaKho9nB_-GAz8GOgyZNPQGCOt9bqitaZAxWtFnynL7mgbEQvQ",
		d: "G4pfK2yUTSBNUrXa0ugXTYS_ZxP4PdonmUKJbRfbewfFoRYR9dVKAi8nT6JDLBtyfn-2kPR1x3xf2GhvCwxBcJcn_anvaWJMkiNxpNV3Xb0yJdQwyUxBngz-74aS1BQKXQMsLUSYU6OEah_zLDGlLTkr0jG-qmppgslqQ3q5uwE",
		e: "AQAB",
		qi: "aseQJG2zgUUHFI1IxhRPj2U-enWHQAA1KAaIcqH1cTzutgB15nKy4a3wqAMVpJ4efKwd-VXmsuhpjuaddKqYJA",
		dp: "tx0AfGt2LteUGITHCADDzU777IIHEp3CLMSpLCHvCrU59rdlbhzJEwd-VUbkU0HKJYJNF69aWc-JE1SAFiUIvw",
		dq: "hkKld79BO5gDYeJ_eq1F5y60DhTkldEHfLvz9QnFtT0W2i6oTA3l33VBr4Z8n0OEL6PcYT58yR9Mki3B41QVuQ",
		n: "gHuHr72EQkVK_SRmyvyv64Sb6jGOB1U9AC9ImDlN5vvuFX947Xi1M8ZxG5ULV3JFSKQ_SIK_MnstR-ClYncwWWasSlaJB7YqYDSOO-OszeT5SkCttS3ZkIPIBJV8QRP-84N76nVuii1lkjLk0z4JEZH_CnIsLyYhNDaaRoavjos",
	};
	const verifyJwk = {
		kty: "RSA",
		e: "AQAB",
		n: "gHuHr72EQkVK_SRmyvyv64Sb6jGOB1U9AC9ImDlN5vvuFX947Xi1M8ZxG5ULV3JFSKQ_SIK_MnstR-ClYncwWWasSlaJB7YqYDSOO-OszeT5SkCttS3ZkIPIBJV8QRP-84N76nVuii1lkjLk0z4JEZH_CnIsLyYhNDaaRoavjos",
	};
	const alg = "RS256";

	fc.assert(
		fc.property(fc.object(), (_payload) => {
			it(`should sign and verify a token with payload ${JSON.stringify(_payload)}`, async () => {
				const payload = {
					..._payload,
					iss: "https://example.com",
					aud: "https://example.com",
					exp: Math.floor(Date.now() / 1000) + 3600,
					iat: Math.floor(Date.now() / 1000),
					jti: "1234567890",
					nbf: Math.floor(Date.now() / 1000),
					sub: "1234567890",
				};
				const token = await sign(payload, signJwk, alg);
				const decoded = await verify(token, verifyJwk, alg);
				expect(decoded.payload).toMatchObject(
					JSON.parse(JSON.stringify(payload)),
				);
			});
		}),
	);
});

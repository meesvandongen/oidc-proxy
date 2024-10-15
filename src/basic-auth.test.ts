import { describe, expect, it } from "bun:test";
import { parseBasicAuth } from "./basic-auth";

describe("parseBasicAuth(string)", () => {
	describe("with malformed string", () => {
		it("should return undefined", () => {
			expect(parseBasicAuth("Something")).toBeUndefined();
		});
	});

	describe("with malformed scheme", () => {
		it("should return undefined", () => {
			expect(parseBasicAuth("basic_Zm9vOmJhcg==")).toBeUndefined();
		});
	});

	describe("with malformed credentials", () => {
		it("should return undefined", () => {
			expect(parseBasicAuth("basic Zm9vcgo=")).toBeUndefined();
		});
	});

	describe("with valid credentials", () => {
		it("should return .name and .pass", () => {
			const creds = parseBasicAuth("basic Zm9vOmJhcg==");
			expect(creds).toEqual({
				name: "foo",
				pass: "bar",
			});
		});
	});

	describe("with empty password", () => {
		it("should return .name and .pass", () => {
			const creds = parseBasicAuth("basic Zm9vOg==");
			expect(creds).toEqual({
				name: "foo",
				pass: "",
			});
		});
	});

	describe("with empty userid", () => {
		it("should return .name and .pass", () => {
			const creds = parseBasicAuth("basic OnBhc3M=");
			expect(creds).toEqual({
				name: "",
				pass: "pass",
			});
		});
	});

	describe("with empty userid and pass", () => {
		it("should return .name and .pass", () => {
			const creds = parseBasicAuth("basic Og==");
			expect(creds).toEqual({
				name: "",
				pass: "",
			});
		});
	});

	describe("with colon in pass", () => {
		it("should return .name and .pass", () => {
			const creds = parseBasicAuth("basic Zm9vOnBhc3M6d29yZA==");
			expect(creds).toEqual({
				name: "foo",
				pass: "pass:word",
			});
		});
	});

	describe('with scheme "Basic"', () => {
		it("should return .name and .pass", () => {
			const creds = parseBasicAuth("Basic Zm9vOmJhcg==");
			expect(creds).toEqual({
				name: "foo",
				pass: "bar",
			});
		});
	});

	describe('with scheme "BASIC"', () => {
		it("should return .name and .pass", () => {
			const creds = parseBasicAuth("BASIC Zm9vOmJhcg==");
			expect(creds).toEqual({
				name: "foo",
				pass: "bar",
			});
		});
	});

	describe('with scheme "BaSiC"', () => {
		it("should return .name and .pass", () => {
			const creds = parseBasicAuth("BaSiC Zm9vOmJhcg==");
			expect(creds).toEqual({
				name: "foo",
				pass: "bar",
			});
		});
	});
});

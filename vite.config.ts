import { defineConfig } from "vite-plus";

export default defineConfig({
	// Mirrors the previous Biome settings: tabs, double quotes, 80 columns,
	// sorted imports, and only JS/TS/JSON files.
	fmt: {
		ignorePatterns: [
			"dist/**",
			"**/*.md",
			"**/*.yaml",
			"**/*.yml",
			"renovate.json",
		],
		useTabs: true,
		printWidth: 80,
		sortImports: { newlinesBetween: false },
		sortPackageJson: false,
	},
	lint: {
		ignorePatterns: ["dist/**"],
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
});

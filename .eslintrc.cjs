module.exports = {
	extends: ['@os3'],
	env: {
		mocha: true,
	},
	ignorePatterns: ['*.tmp', '*.tmp.*', '/docs', '/coverage', '/types'],
	rules: {
		"@typescript-eslint/no-var-requires": "off"
	},
};

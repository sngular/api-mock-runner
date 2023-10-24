module.exports = {
	extends: ['@os3', 'prettier'],
	env: {
		mocha: true,
	},
	ignorePatterns: ['*.tmp', '*.tmp.*', '/docs', '/coverage', '/types'],
	rules: {
		'@typescript-eslint/no-var-requires': 'off',
		'no-console': 'error',
	},
};

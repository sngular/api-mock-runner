module.exports = {
	extends: ['@os3/eslint-config', '@os3/eslint-config/prettier.cjs'],
	env: {
		mocha: true,
	},
	ignorePatterns: ['/coverage', './dist-types'],
};

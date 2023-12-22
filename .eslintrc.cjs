module.exports = {
	extends: [
		'@sngular/eslint-config',
		'@sngular/eslint-config/jsdoc.cjs',
		'@sngular/eslint-config/type-information.cjs',
		'@sngular/eslint-config/prettier.cjs',
	],
	env: {
		mocha: true,
	},
	ignorePatterns: ['/coverage', './dist-types'],
	overrides: [
		{
			extends: ['plugin:@typescript-eslint/disable-type-checked'],
			files: ['./test/**/*', 'types/**/*', 'dist-types/**/*', './*.cjs'],
		},
	],
};

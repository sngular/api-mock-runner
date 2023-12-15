module.exports = {
	'*.{js,cjs,mjs,jsx,ts,tsx}': ['prettier --write', 'eslint --fix', () => 'npm run types:check'],
	'*.{md,html,css}': ['prettier --write'],
};

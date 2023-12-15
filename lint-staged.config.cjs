module.exports = {
	'*.{js,cjs,mjs,jsx,ts,tsx}': ['npm run format:fix', 'npm run lint:fix', () => 'npm run types:check'],
	'*.{md,html,css}': ['npm run format:fix'],
};

import { askForPorts, assignPorts, saveRuntimeConfig } from './helpers.js';
/**
 * @typedef {import('../../types/types.d.js').Config} Config
 * @typedef {import('../../types/types.d.js').Options} Options
 */

/**
 * Start flow without config.
 * @async
 * @function init
 * @param {Options} options - Cli options.
 * @returns {Promise<Config>} A object with the complete config.
 */
export async function initWithSchemaPaths({ schemaPaths, ports } = { schemaPaths: [], ports: [] }) {
	const selectedSchemas = ports?.length ? assignPorts(schemaPaths, ports) : await askForPorts(schemaPaths);
	const config = { selectedSchemas };

	await saveRuntimeConfig(config);

	return config;
}

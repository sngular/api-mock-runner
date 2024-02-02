import { program } from 'commander';

import { getConfigFromFile } from './helpers/config-file.js';
import { startMockServer } from './services/start-mock-server.js';
import { initWithConfigFile } from './services/user-flow-steps/init-with-config-file.js';
import { initWithSchemaPaths } from './services/user-flow-steps/init-with-schema-paths.js';
import { init } from './services/user-flow-steps/init.js';

/**
 * @typedef {import('./types/types.d.js').Config} Config
 * @typedef {import('./types/types.d.js').Options} Options
 * @typedef {import('./types/types.d.js').ProgramOptions} ProgramOptions
 */

/**
 * Main function to start the mock server.
 * @async
 * @function run
 * @returns {Promise<void>}
 */
export const main = async () => {
	program
		.option('-o, --origin <origin>', 'path or repo containing schemas')
		.option('-s, --schema [schemaPaths...]', 'path to schemas')
		.option('-p, --port [ports...]', 'port to serve each schema')
		.option('-r, --run-config', 'use saved config');
	program.parse();
	/** @type {ProgramOptions} */
	const options = program.opts();
	let config;
	if (options.runConfig) {
		config = getConfigFromFile();
	} else if (options?.origin) {
		config = await init({
			origin: options.origin,
			schemaPaths: options.schema,
			ports: options.port,
		});
	} else if (options?.schema?.length) {
		config = await initWithSchemaPaths({
			schemaPaths: options.schema,
			ports: options.port,
		});
	} else {
		config = await initWithConfigFile();
	}
	if (!config) {
		config = await init();
	}
	return startMockServer(config.selectedSchemas);
};

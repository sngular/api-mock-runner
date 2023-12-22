import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';

import { RC_FILE_NAME } from './helpers/constants.js';
import { Logger } from './helpers/logger.js';
import { messages } from './helpers/messages.js';
import { startMockServer } from './services/start-mock-server.js';
import { userFlowSteps } from './services/user-flow-steps.js';
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
const run = async () => {
	program
		.option('-o, --origin <origin>', 'path or repo containing schemas')
		.option('-s, --schema [schemaPaths...]', 'path to schemas')
		.option('-p, --port [ports...]', 'port to serve each schema')
		.option('-r, --run-config', 'use saved config');
	program.parse();
	const options = /** @type {ProgramOptions} */ (program.opts());
	const configFileExists = fs.existsSync(path.join(process.cwd(), RC_FILE_NAME));
	let config;
	if (options.runConfig) {
		if (configFileExists) {
			config = getConfigFromFile();
		} else {
			Logger.warn(messages.CONFIG_FILE_NOT_FOUND, RC_FILE_NAME);
		}
	} else if (options?.origin) {
		config = await userFlowSteps.init({
			origin: options.origin,
			schemaPaths: options.schema,
			ports: options.port,
		});
	} else if (options?.schema?.length) {
		config = await userFlowSteps.initWithSchemaPaths({
			schemaPaths: options.schema,
			ports: options.port,
		});
	} else if (configFileExists) {
		config = await userFlowSteps.initWithConfigFile();
	}
	if (!config) {
		config = await userFlowSteps.init();
	}
	return startMockServer.run(config.selectedSchemas);
};

/**
 * Get config from file.
 * @function getConfigFromFile
 * @returns {Config} Content of the config file.
 */
function getConfigFromFile() {
	return /** @type {Config} */ (JSON.parse(fs.readFileSync(path.join(process.cwd(), RC_FILE_NAME), 'utf-8'))) || {};
}

export const main = { run };

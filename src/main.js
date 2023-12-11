import * as fs from 'node:fs';
import { program } from 'commander';
import { startMockServer } from './services/start-mock-server.js';
import { userFlowSteps } from './services/user-flow-steps.js';
import { RC_FILE_NAME } from './services/utils.js';
import Logger from './utils/logger.js';
import { messages } from './utils/messages.js';

/**
 * Main function to start the mock server
 * @async
 * @function main
 * @returns {Promise<void>}
 */
const main = async () => {
	program
		.option('-o, --origin <origin>', 'path or repo containing schemas')
		.option('-s, --schema [schemaPaths...]', 'path to schemas')
		.option('-p, --port [ports...]', 'port to serve each schema')
		.option('-r, --run-config', 'use saved config');

	program.parse();

	const options = program.opts();
	const configFileExists = fs.existsSync(`${process.cwd()}/${RC_FILE_NAME}`);
	if (options.runConfig && !configFileExists) {
		Logger.warn(messages.CONFIG_FILE_NOT_FOUND, RC_FILE_NAME);
		const config = await userFlowSteps.init();
		return startMockServer.run(config.selectedSchemas);
	}
	if (options.runConfig) {
		const config = JSON.parse(fs.readFileSync(`${process.cwd()}/${RC_FILE_NAME}`));
		return startMockServer.run(config.selectedSchemas);
	}
	if (options?.origin) {
		const config = await userFlowSteps.init({
			origin: options.origin,
			schemaPaths: options.schema,
			ports: options.port,
		});
		return startMockServer.run(config.selectedSchemas);
	}
	if (options?.schema?.length) {
		const config = await userFlowSteps.initWithSchemaPaths({
			schemaPaths: options.schema,
			ports: options.port,
		});
		return startMockServer.run(config.selectedSchemas);
	}
	if (configFileExists) {
		const config = await userFlowSteps.initWithConfigFile();
		return startMockServer.run(config.selectedSchemas);
	}
	const config = await userFlowSteps.init();
	return startMockServer.run(config.selectedSchemas);
};

export { main };

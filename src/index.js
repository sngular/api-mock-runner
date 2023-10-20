import * as fs from 'node:fs';
import { initWithConfigFile, startMockServer, startFlow } from './services/user-flow-steps.js';
import { RC_FILE_NAME } from './services/utils.js';

/**
 * Main function to start the mock server
 * @async
 * @function main
 * @returns {Promise<void>}
 */
const main = async () => {
	const configFileExists = fs.existsSync(`${process.cwd()}/${RC_FILE_NAME}`);
	const config = configFileExists ? await initWithConfigFile() : await startFlow();
	await startMockServer(config.ports, config.selectedSchemas);
};
main();

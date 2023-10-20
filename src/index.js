import { checkbox } from '@inquirer/prompts';
import * as fs from 'node:fs';
import { initWithConfigFile, initNoConfigFile, getSchemas, startMockServer } from './services/user-flow-steps.js';
import { RC_FILE_NAME } from './services/utils.js';

/**
 * Main function to start the mock server
 * @async
 * @function main
 * @returns {Promise<void>}
 */
const main = async () => {
	const configFileExists = fs.existsSync(`${process.cwd()}/${RC_FILE_NAME}`);

	const config = configFileExists ? await initWithConfigFile() : await initNoConfigFile();

	const schemas = await getSchemas(config.schemasOrigin);

	const selectedSchemas = await checkbox({
		message: 'Select a schema',
		choices: schemas.map((schema) => {
			return { name: schema.fileName, value: schema.filePath };
		}),
	});
	await startMockServer(config.initialPort, selectedSchemas);
};

main();

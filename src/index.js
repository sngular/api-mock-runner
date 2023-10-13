import { select } from '@inquirer/prompts';
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
	let config;

	const configFileExists = fs.existsSync(`${process.cwd()}/${RC_FILE_NAME}`);

	if (configFileExists) {
		config = await initWithConfigFile();
	} else {
		config = await initNoConfigFile();
	}

	const schemas = await getSchemas(config.schemasOrigin);

	// TODO: change to checkboxes when multiple schemas are supported
	const selectedSchema = await select({
		message: 'Select a schema',
		choices: schemas.map((schema) => {
			return { name: schema.fileName, value: schema.filePath };
		}),
	});

	await startMockServer(config.initialPort, selectedSchema);
};
main();

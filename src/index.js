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
	const configFileExists = fs.existsSync(`${process.cwd()}/${RC_FILE_NAME}`);

	const config = configFileExists ? await initWithConfigFile() : await initNoConfigFile();

	const schemas = await getSchemas(config.schemasOrigin);

	if (schemas.length > 0) {
		// TODO: change to checkboxes when multiple schemas are supported
		const selectedSchema = await select({
			message: 'Select a schema',
			choices: schemas.map((schema) => {
				return { name: schema.fileName, value: schema.filePath };
			}),
		});

		// Create .apimockrc file
		const filePath = `${process.cwd()}/${RC_FILE_NAME}`;
		fs.writeFileSync(filePath, JSON.stringify(config));

		await startMockServer(config.initialPort, selectedSchema);
	} else {
		console.log(`No OpenApi schemas found at ${config.schemasOrigin}`);
	}
};

main();

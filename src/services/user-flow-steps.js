import { input, confirm, checkbox } from '@inquirer/prompts';
import * as fs from 'node:fs';
import OpenApiMocker from 'open-api-mocker';
import cloneGitRepository from '../services/clone-git-repository.js';
import findOasFromDir from '../services/find-oas-from-dir.js';
import { addToGitignore, verifyRemoteOrigin, TEMP_FOLDER_NAME, RC_FILE_NAME, overwriteFile } from './utils.js';
/**
 * @typedef {Object} Config
 * @property {string} schemasOrigin - The origin of the schemas (local or remote)
 * @property {number} initialPort - The initial port to start the mock server
 */

/**
 * User flow when the config file already exists
 * @async
 * @function initWithConfigFile
 * @returns {Promise<Config>} A object with the initial values from the user
 */
async function initWithConfigFile() {
	let config;
	const existingConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/${RC_FILE_NAME}`));
	console.log(existingConfig);
	const useExistingConfig = await confirm({
		message: 'Do you want to use the existing config?',
	});
	if (useExistingConfig) {
		config = existingConfig;
	} else {
		config = await startFlow();
	}
	return config;
}

/**
 * User flow when the config file doesn't exist
 * @async
 * @function initNoConfigFile
 * @returns {Promise<Config>} A object with the initial values from the user
 */
async function initNoConfigFile() {
	const config = await getInitialValues();
	const addRcFileToGitignore = await confirm({
		message: `Add ${RC_FILE_NAME} to .gitignore?`,
	});
	if (addRcFileToGitignore) {
		await addToGitignore(RC_FILE_NAME);
	}
	return config;
}

/**
 * Get the schemas from the origin
 * @async
 * @function getSchemas
 * @param {string} origin - The origin of the schemas (local or remote)
 * @returns {Promise<Array>} An array of schemas
 */
async function getSchemas(origin) {
	const isOriginRemote = verifyRemoteOrigin(origin);

	if (isOriginRemote) {
		cloneGitRepository(origin, TEMP_FOLDER_NAME);
		await addToGitignore(TEMP_FOLDER_NAME);
	}

	const schemasDir = isOriginRemote ? TEMP_FOLDER_NAME : origin;

	const schemas = await findOasFromDir(schemasDir);
	return schemas;
}

/**
 * Start the mock server
 * @async
 * @function startMockServer
 * @param {number[]} ports - ports for each schema
 * @param {string[]} schemas - An array of schemas
 * @returns {Promise<void>}
 */
async function startMockServer(ports, schemas) {
	for (let i = 0; i < schemas.length; i++) {
		const openApiMocker = new OpenApiMocker({
			port: ports[i],
			schema: schemas[i],
			watch: true,
		});

		await openApiMocker.validate();

		await openApiMocker.mock();
	}
}
/**
 * get initial values from user
 * @async
 * @returns {Promise<Config>} A object with the initial values from the user
 */
async function getInitialValues() {
	// TODO: Add input validation
	const schemasOrigin = await input({
		message: 'Enter the repo url or relative path',
	});

	const config = {
		schemasOrigin,
	};
	return config;
}

async function startFlow() {
	let config;
	config = await initNoConfigFile();

	const schemas = await getSchemas(config.schemasOrigin);

	const selectedSchemas = await checkbox({
		message: 'Select a schema',
		choices: schemas.map((schema) => {
			return { name: schema.fileName, value: schema.filePath };
		}),
	});

	config.selectedSchemas = selectedSchemas;
	const ports = await askForPorts(selectedSchemas);
	config.ports = ports;

	overwriteFile(`${process.cwd()}/${RC_FILE_NAME}`, JSON.stringify(config));
	return config;
}

async function askForPorts(selectedSchemas) {
	let ports = [];
	let suggestedPort = 1234;
	for (const schema of selectedSchemas) {
		const port = await input({
			message: `Select a port for ${schema}`,
			default: suggestedPort,
		});
		ports.push(port);
		suggestedPort++;
	}

	return ports;
}

export { initWithConfigFile, initNoConfigFile, getSchemas, startMockServer, startFlow };

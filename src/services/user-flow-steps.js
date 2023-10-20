import { input, confirm, checkbox } from '@inquirer/prompts';
import * as fs from 'node:fs';
import OpenApiMocker from 'open-api-mocker';
import cloneGitRepository from '../services/clone-git-repository.js';
import findOasFromDir from '../services/find-oas-from-dir.js';
import { addToGitignore, verifyRemoteOrigin, TEMP_FOLDER_NAME, RC_FILE_NAME } from './utils.js';
/**
 * @typedef {Object} Config
 * @property {string} schemasOrigin - The origin of the schemas (local or remote)
 * @property {string[]} selectedSchemas - An array of schemas
 * @property {number[]} ports - The initial port to start the mock server
 */

/**
 * User flow when the config file already exists
 * @async
 * @function initWithConfigFile
 * @returns {Promise<Config>} A object with the initial values from the user
 */
async function initWithConfigFile() {
	const existingConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/${RC_FILE_NAME}`));
	console.log(existingConfig);
	const useExistingConfig = await confirm({
		message: 'Do you want to use the existing config?',
	});
	return useExistingConfig ? existingConfig : await init();
}

/**
 * first step when the config file doesn't exist
 * @async
 * @function initNoConfigFile
 * @returns {Promise<string>} path or url of the schemas
 */
async function startNewFlow() {
	const schemasOrigin = await getOrigin();
	const addRcFileToGitignore = await confirm({
		message: `Add ${RC_FILE_NAME} to .gitignore?`,
	});
	if (addRcFileToGitignore) {
		await addToGitignore(RC_FILE_NAME);
	}

	return schemasOrigin;
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
 * @param {Schema[]} selectedSchemas - An array of schemas
 * @returns {Promise<void>}
 */
async function startMockServer(selectedSchemas) {
	for (let currentSchema of selectedSchemas) {
		const openApiMocker = new OpenApiMocker({
			port: currentSchema.port,
			schema: currentSchema.path,
			watch: true,
		});
		await openApiMocker.validate();

		await openApiMocker.mock();
		console.log();
	}
}
/**
 * get initial values from user
 * @async
 * @function getOrigin
 * @returns {Promise<string>} The origin of the schemas (local or remote)
 */
async function getOrigin() {
	// TODO: Add input validation
	const schemasOrigin = await input({
		message: 'Enter the repo url or relative path',
	});
	return schemasOrigin;
}
/**
 * Start flow without config
 * @async
 * @function init
 * @returns {Promise<Config>} A object with the complete config
 */
async function init() {
	const schemasOrigin = await startNewFlow();

	const schemas = await getSchemas(schemasOrigin);

	const schemasToMock = await checkbox({
		message: 'Select a schema',
		choices: schemas.map((schema) => {
			return { name: schema.fileName, value: schema.filePath };
		}),
	});

	const selectedSchemas = await askForPorts(schemasToMock);
	const config = { schemasOrigin, selectedSchemas };

	fs.writeFileSync(`${process.cwd()}/${RC_FILE_NAME}`, JSON.stringify(config, null, '\t'));
	console.log(config);

	return config;
}

/**
 * @typedef {Object} Schema
 * @property {string} path - The path of the schema
 * @property {number} port - The port for the schema
 */

/**
 * Ask for ports for each schema
 * @async
 * @function askForPorts
 * @param {string[]} schemaPaths - An array of schemas
 * @returns {Promise<Schema[]>} An array of selected Schemas
 */
async function askForPorts(schemaPaths) {
	const selectedSchemas = [];
	let suggestedPort = 1234;
	for (const schemaPath of schemaPaths) {
		const port = await input({
			message: `Select a port for ${schemaPath}`,
			default: suggestedPort,
		});
		const portNumber = parseInt(port);
		const schema = { path: schemaPath, port: portNumber };
		selectedSchemas.push(schema);
		suggestedPort++;
	}
	return selectedSchemas;
}

export { initWithConfigFile, startMockServer, init };

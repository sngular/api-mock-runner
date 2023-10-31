import { checkbox, confirm, input } from '@inquirer/prompts';
import * as fs from 'node:fs';
import { OpenApiSchemaNotFoundError } from '../errors/openapi-schema-not-found-error.js';
import cloneGitRepository from '../services/clone-git-repository.js';
import findOasFromDir from '../services/find-oas-from-dir.js';
import addToGitignore from './gitignore.js';
import { originValidator, portValidator } from './inquirer-validators.js';
import { RC_FILE_NAME, TEMP_FOLDER_NAME, verifyRemoteOrigin } from './utils.js';
/**
 * @typedef {import('../types/types.js').Config} Config
 * @typedef {import('../types/types.js').Options} Options
 * @typedef {import('../types/types.js').Schema} Schema
 */

/**
 * User flow when the config file already exists
 * @async
 * @function initWithConfigFile
 * @returns {Promise<Config>} An object with the initial values from the user
 */
async function initWithConfigFile() {
	const existingConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/${RC_FILE_NAME}`));
	console.log(existingConfig);
	const useExistingConfig = await confirm({
		message: 'Do you want to use the existing config?',
	});
	return useExistingConfig ? existingConfig : init();
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
 * get initial values from user
 * @async
 * @function getOrigin
 * @returns {Promise<string>} The origin of the schemas (local or remote)
 */
async function getOrigin() {
	const schemasOrigin = await input({
		message: 'Enter a remote origin (https:// or git@) or local path',
		validate: originValidator,
	});
	return schemasOrigin;
}

/**
 * Start flow without config
 * @async
 * @function init
 * @param {Options} options - cli options
 * @returns {Promise<Config>} A object with the complete config
 * @throws {OpenApiSchemaNotFoundError} When no schemas are found in the given directory
 */
async function init({ origin, schemaPaths, ports } = {}) {
	const schemasOrigin = origin || (await getOrigin());
	const schemas = await getSchemas(schemasOrigin);
	if (!schemas.length) {
		throw new OpenApiSchemaNotFoundError();
	}

	const schemasFilePaths = schemas.map((s) => s.filePath);
	const schemaPathsAreAvailable = schemaPaths?.every((path) => schemasFilePaths.includes(path));

	const schemasToMock = schemaPathsAreAvailable
		? schemaPaths
		: await checkbox({
				message: 'Select a schema',
				choices: schemas.map((schema) => {
					return { value: schema.filePath };
				}),
				// TODO: pending validation to ensure that at least one schema is selected. Waiting next inquirer release.
		  });

	const selectedSchemas = ports?.length ? assignPorts(schemasToMock, ports) : await askForPorts(schemasToMock);
	const config = { schemasOrigin, selectedSchemas };

	fs.writeFileSync(`${process.cwd()}/${RC_FILE_NAME}`, JSON.stringify(config, null, '\t'));
	console.log(config);
	await addToGitignore(RC_FILE_NAME);

	return config;
}

/**
 * Start flow without config
 * @async
 * @function init
 * @param {Options} options - cli options
 * @returns {Promise<Config>} A object with the complete config
 */
async function initWithSchemaPaths({ schemaPaths, ports } = {}) {
	const selectedSchemas = ports?.length ? assignPorts(schemaPaths, ports) : await askForPorts(schemaPaths);
	const config = { selectedSchemas };

	fs.writeFileSync(`${process.cwd()}/${RC_FILE_NAME}`, JSON.stringify(config, null, '\t'));
	console.log(config);

	return config;
}

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
			validate: (input) => portValidator(input, selectedSchemas),
		});
		const portNumber = parseInt(port);
		const schema = { path: schemaPath, port: portNumber };
		selectedSchemas.push(schema);
		suggestedPort++;
	}
	return selectedSchemas;
}

/**
 * Assigns ports for each schema
 * @function assignPorts
 * @param {string[]} schemaPaths - An array of schemas
 * @param {string[]} ports - An array of ports
 * @returns {Schema[]} An array of selected Schemas
 */
function assignPorts(schemaPaths, ports) {
	return schemaPaths.map((schemaPath, i) => {
		const portNumber = Number.parseInt(ports[i]) || Number.parseInt(ports[ports.length - 1]) + (i + 1 - ports.length);
		return { path: schemaPath, port: portNumber };
	});
}

export { initWithConfigFile, initWithSchemaPaths, init };

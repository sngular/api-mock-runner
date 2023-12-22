import { checkbox, confirm, input } from '@inquirer/prompts';
import fs from 'node:fs';
import path from 'node:path';

import addToGitignore from './gitignore.js';
import { originValidator, portValidator } from './inquirer-validators.js';
import { OpenApiSchemaNotFoundError } from '../errors/openapi-schema-not-found-error.js';
import { RC_FILE_NAME, TEMP_FOLDER_NAME } from '../helpers/constants.js';
import Logger from '../helpers/logger.js';
import { messages } from '../helpers/messages.js';
import { verifyRemoteOrigin } from '../helpers/verify-remote-origin.js';
import cloneGitRepository from '../services/clone-git-repository.js';
import { findOasFromDir, findOasFromDirRecursive } from '../services/find-oas-from-dir.js';

/**
 * @typedef {import('../types/types.d.js').Config} Config
 * @typedef {import('../types/types.d.js').Options} Options
 * @typedef {import('../types/types.d.js').Schema} Schema
 * @typedef {import('../types/types.d.js').OasFile} OasFile
 */

/**
 * User flow when the config file already exists.
 * @async
 * @function initWithConfigFile
 * @returns {Promise<Config>} An object with the initial values from the user.
 */
async function initWithConfigFile() {
	const configFilePath = path.join(process.cwd(), RC_FILE_NAME);
	const fileContent = fs.readFileSync(configFilePath, 'utf-8');
	const existingConfig = /** @type {Config} */ (JSON.parse(fileContent)) || {};
	Logger.info(messages.CURRENT_CONFIG, existingConfig);
	const useExistingConfig = await confirm({
		message: messages.CONFIRM_EXISTING_CONFIG,
	});
	return useExistingConfig ? existingConfig : userFlowSteps.init();
}

/**
 * Get the schemas from the origin.
 * @async
 * @function getSchemas
 * @param {string} origin - The origin of the schemas (local or remote).
 * @returns {Promise<OasFile[]>} An array of schemas.
 */
async function getSchemas(origin) {
	const isOriginRemote = verifyRemoteOrigin(origin);

	if (isOriginRemote) {
		cloneGitRepository(origin, TEMP_FOLDER_NAME);
		await addToGitignore(TEMP_FOLDER_NAME);
	}

	const schemas = isOriginRemote ? await findOasFromDirRecursive(TEMP_FOLDER_NAME) : await findOasFromDir(origin);
	return schemas;
}

/**
 * Get the schemas origin from the user.
 * @async
 * @function getOrigin
 * @returns {Promise<string>} The origin of the schemas (local absolute path or remote origin).
 */
async function getOrigin() {
	const schemasOrigin = await input({
		message: messages.INPUT_ORIGIN,
		validate: originValidator,
	});

	return verifyRemoteOrigin(schemasOrigin) ? schemasOrigin : path.resolve(schemasOrigin);
}

/**
 * Start flow without config.
 * @async
 * @function init
 * @param {Options} [options] - Cli options.
 * @returns {Promise<Config>} A object with the complete config.
 * @throws {OpenApiSchemaNotFoundError} When no schemas are found in the given directory.
 */
async function init({ origin, schemaPaths, ports } = { schemaPaths: [], ports: [] }) {
	const schemasOrigin = origin || (await getOrigin());
	const schemas = await getSchemas(schemasOrigin);
	if (!schemas.length) {
		throw new OpenApiSchemaNotFoundError();
	}

	const schemasFilePaths = schemas.map((s) => s.filePath);
	const schemaPathsAreAvailable =
		Boolean(schemaPaths.length) && schemaPaths.every((path) => schemasFilePaths.includes(path));

	const schemasToMock = schemaPathsAreAvailable
		? schemaPaths
		: await checkbox({
				message: messages.CHOOSE_FILES,
				choices: schemas.map((schema) => {
					return { value: schema.filePath };
				}),
				required: true,
		  });

	const selectedSchemas = ports?.length ? assignPorts(schemasToMock, ports) : await askForPorts(schemasToMock);
	/** @type {Config} */
	const config = { schemasOrigin, selectedSchemas };

	fs.writeFileSync(path.join(process.cwd(), RC_FILE_NAME), JSON.stringify(config, null, '\t'));
	Logger.info(messages.SAVED_CONFIG(RC_FILE_NAME), config);
	await addToGitignore(RC_FILE_NAME);

	return config;
}

/**
 * Start flow without config.
 * @async
 * @function init
 * @param {Options} options - Cli options.
 * @returns {Promise<Config>} A object with the complete config.
 */
async function initWithSchemaPaths({ schemaPaths, ports } = { schemaPaths: [], ports: [] }) {
	const selectedSchemas = ports?.length ? assignPorts(schemaPaths, ports) : await askForPorts(schemaPaths);
	const config = { selectedSchemas };

	fs.writeFileSync(path.join(process.cwd(), RC_FILE_NAME), JSON.stringify(config, null, '\t'));
	Logger.info(messages.USING_PROVIDED_CONFIG, config);

	return config;
}

/**
 * Ask for ports for each schema.
 * @async
 * @function askForPorts
 * @param {string[]} schemaPaths - An array of schemas.
 * @returns {Promise<Schema[]>} An array of selected Schemas.
 */
async function askForPorts(schemaPaths) {
	/** @type {Schema[]} */
	const selectedSchemas = [];
	let suggestedPort = 1234;
	for (const schemaPath of schemaPaths) {
		const port = await input({
			message: messages.INPUT_PORT(schemaPath),
			default: suggestedPort.toString(),
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
 * Assigns ports for each schema.
 * @function assignPorts
 * @param {string[]} schemaPaths - An array of schemas.
 * @param {string[]} ports - An array of ports.
 * @returns {Schema[]} An array of selected Schemas.
 */
function assignPorts(schemaPaths, ports) {
	return schemaPaths.map((schemaPath, i) => {
		const portNumber = Number.parseInt(ports[i]) || Number.parseInt(ports[ports.length - 1]) + (i + 1 - ports.length);
		return { path: schemaPath, port: portNumber };
	});
}
export const userFlowSteps = { initWithConfigFile, initWithSchemaPaths, init };

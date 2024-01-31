import input from '@inquirer/input';
import { writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { cwd } from 'node:process';

import { RC_FILE_NAME, TEMP_FOLDER_NAME } from '../../helpers/constants.js';
import { Logger } from '../../helpers/logger.js';
import { messages } from '../../helpers/messages.js';
import { verifyRemoteOrigin } from '../../helpers/verify-remote-origin.js';
import { cloneRepository } from '../clone-git-repository.js';
import { findOasFromDir, findOasFromDirRecursive } from '../find-oas-from-dir.js';
import { addToGitignore } from '../gitignore.js';
import { portValidator, originValidator } from '../inquirer-validators.js';

/**
 * @typedef {import('../../types/types.d.js').Config} Config
 * @typedef {import('../../types/types.d.js').Options} Options
 * @typedef {import('../../types/types.d.js').Schema} Schema
 * @typedef {import('../../types/types.d.js').OasFile} OasFile
 */

const DEFAULT_PORT = 1234;

/**
 * Get the schemas from the origin.
 * @async
 * @function getSchemas
 * @param {string} origin - The origin of the schemas (local or remote).
 * @returns {Promise<OasFile[]>} An array of schemas.
 */
export async function getSchemas(origin) {
	const isOriginRemote = verifyRemoteOrigin(origin);

	if (isOriginRemote) {
		cloneRepository(origin, TEMP_FOLDER_NAME);
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
export async function getOrigin() {
	const schemasOrigin = await input({
		message: messages.INPUT_ORIGIN,
		validate: originValidator,
	});

	return verifyRemoteOrigin(schemasOrigin) ? schemasOrigin : resolve(schemasOrigin);
}

/**
 * Ask for ports for each schema.
 * @async
 * @function askForPorts
 * @param {string[]} schemaPaths - An array of schemas.
 * @returns {Promise<Schema[]>} An array of selected Schemas.
 */
export async function askForPorts(schemaPaths) {
	/** @type {Schema[]} */
	const selectedSchemas = [];
	let suggestedPort = DEFAULT_PORT;
	for (const schemaPath of schemaPaths) {
		const port = await input({
			message: messages.INPUT_PORT(schemaPath),
			default: suggestedPort.toString(),
			validate: (input) => portValidator(input, selectedSchemas),
		});
		const portNumber = parseInt(port);
		const schema = { path: schemaPath, port: portNumber };
		selectedSchemas.push(schema);
		suggestedPort = portNumber + 1;
	}
	return selectedSchemas;
}

/**
 * Assigns ports for each schema.
 * @function assignPorts
 * @param {string[]} schemaPaths - An array of schemas.
 * @param {string[]} [ports] - An array of ports, if not provided starts with default 1234.
 * @returns {Schema[]} An array of selected Schemas.
 */
export function assignPorts(schemaPaths, ports) {
	const portsToAssign = ports?.length ? ports : [DEFAULT_PORT.toString()];
	return schemaPaths.map((schemaPath, i) => {
		const portNumber =
			Number.parseInt(portsToAssign[i]) ||
			Number.parseInt(portsToAssign[portsToAssign.length - 1]) + (i + 1 - portsToAssign.length);
		return { path: schemaPath, port: portNumber };
	});
}

/**
 * Save runtime config into rc file.
 * @param {Config} config Config object to write.
 * @returns {Promise<void>} Promise object represents the void return.
 */
export async function saveRuntimeConfig(config) {
	writeFileSync(join(cwd(), RC_FILE_NAME), JSON.stringify(config, null, '\t'));
	Logger.info(messages.SAVED_CONFIG(RC_FILE_NAME), config);
	await addToGitignore(RC_FILE_NAME);
}

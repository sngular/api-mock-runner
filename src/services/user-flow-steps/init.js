import { checkbox } from '@inquirer/prompts';

import { askForPorts, assignPorts, getOrigin, getSchemas, saveRuntimeConfig } from './helpers.js';
import { OpenApiSchemaNotFoundError } from '../../errors/openapi-schema-not-found-error.js';
import { messages } from '../../helpers/messages.js';

/**
 * @typedef {import('../../types/types.d.js').Config} Config
 * @typedef {import('../../types/types.d.js').Options} Options
 */

/**
 * Start flow without config.
 * @async
 * @function init
 * @param {Options} [options] - Cli options.
 * @returns {Promise<Config>} A object with the complete config.
 * @throws {OpenApiSchemaNotFoundError} When no schemas are found in the given directory.
 */
export async function init({ origin, schemaPaths, ports } = { schemaPaths: [], ports: [] }) {
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
	const config = { schemasOrigin, selectedSchemas };
	await saveRuntimeConfig(config);
	return config;
}

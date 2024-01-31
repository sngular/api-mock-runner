import OpenApiMocker from '@sngular/open-api-mocker';
import { existsSync } from 'node:fs';

import { init } from './user-flow-steps/init.js';
import { Logger } from '../helpers/logger.js';
import { messages } from '../helpers/messages.js';

/**
 * @typedef {import('../types/types.d.js').Schema} Schema
 * @typedef {import('../types/types.d.js').OpenApiMockerOptions} OpenApiMockerOptions
 */

/**
 * Start the mock server.
 * @async
 * @function run
 * @param {Schema[]} schemas - An array of schemas.
 * @returns {Promise<void>}
 */
export async function startMockServer(schemas) {
	const validatedSchemas = await validateSchemas(schemas);
	for (const schema of validatedSchemas) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
		const openApiMocker = new OpenApiMocker({
			port: schema.port,
			schema: schema.path,
			watch: true,
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
		await openApiMocker.validate();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
		await openApiMocker.mock();
		// Separate each server execution with an empty line
		Logger.emptyLine();
	}
}

/**
 * Validate schemas.
 * @async
 * @function validateSchemas
 * @param {Schema[]} schemas - An array of schemas.
 * @returns {Promise<Schema[]>} - An array of valid schemas.
 */
async function validateSchemas(schemas) {
	const allSchemasExists = schemas.every((schema) => existsSync(schema.path));

	if (!allSchemasExists) {
		Logger.warn(messages.SOME_SCHEMA_DOES_NOT_EXIST);
		const config = await init();
		return config.selectedSchemas;
	}
	return schemas;
}

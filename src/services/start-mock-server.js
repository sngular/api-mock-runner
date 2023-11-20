import fs from 'fs';
import OpenApiMocker from '@os3/open-api-mocker';
import Logger from '../utils/logger.js';
import { init } from './user-flow-steps.js';
import { messages } from '../utils/messages.js';

/**
 * @typedef {import('../types/schema.js').Schema} Schema
 */

/**
 * Start the mock server
 * @async
 * @function startMockServer
 * @param {Schema[]} schemas - An array of schemas
 * @returns {Promise<void>}
 */
async function startMockServer(schemas) {
	const validatedSchemas = await validateSchemas(schemas);
	for (const schema of validatedSchemas) {
		const openApiMocker = new OpenApiMocker({
			port: schema.port,
			schema: schema.path,
			watch: true,
		});

		await openApiMocker.validate();
		await openApiMocker.mock();
		// Separate each server execution with an empty line
		Logger.emptyLine();
	}
}

/**
 * Validate schemas
 * @async
 * @function validateSchemas
 * @param {Schema[]} schemas - An array of schemas
 * @returns {Promise<Schema[]>}
 */
async function validateSchemas(schemas) {
	const allSchemasExists = schemas.every((schema) => fs.existsSync(schema.path));

	if (!allSchemasExists) {
		Logger.warn(messages.SOME_SCHEMA_DOES_NOT_EXIST);
		const config = await init();
		return config.selectedSchemas;
	}
	return schemas;
}

export default startMockServer;

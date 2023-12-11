import fs from 'node:fs';
import OpenApiMocker from '@os3/open-api-mocker';
import Logger from '../utils/logger.js';
import { userFlowSteps } from './user-flow-steps.js';
import { messages } from '../utils/messages.js';

/**
 * @typedef {import('../types/schema.js').Schema} Schema
 */

/**
 * Start the mock server
 * @async
 * @function run
 * @param {Schema[]} schemas - An array of schemas
 * @returns {Promise<void>}
 */
async function run(schemas) {
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
 * @returns {Promise<Schema[]>} - An array of validated schemas
 */
async function validateSchemas(schemas) {
	const allSchemasExists = schemas.every((schema) => fs.existsSync(schema.path));

	if (!allSchemasExists) {
		Logger.warn(messages.SOME_SCHEMA_DOES_NOT_EXIST);
		const config = await userFlowSteps.init();
		return config.selectedSchemas;
	}
	return schemas;
}

export const startMockServer = { run };

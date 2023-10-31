import fs from 'fs';
import OpenApiMocker from '@os3/open-api-mocker';
import { init } from './user-flow-steps.js';

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
		// Separate each server with a empty line
		console.log();
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
	const allSchemasExists = schemas.reduce(
		(acc, schema) => (fs.existsSync(`${process.cwd()}/${schema.path}`) ? acc : false),
		true
	);
	if (!allSchemasExists) {
		console.log('Any schema does not exists');
		const config = await init();
		return config.selectedSchemas;
	}
	return schemas;
}

export default startMockServer;

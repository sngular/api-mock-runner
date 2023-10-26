import OpenApiMocker from '@os3/open-api-mocker';

/**
 * @typedef {import('./user-flow-steps.js').Schema} Schema
 */

/**
 * Start the mock server
 * @async
 * @function startMockServer
 * @param {Schema[]} schemas - An array of schemas
 * @returns {Promise<void>}
 */
async function startMockServer(schemas) {
	for (const schema of schemas) {
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

export default startMockServer;

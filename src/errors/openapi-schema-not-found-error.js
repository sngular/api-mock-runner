import { messages } from '../utils/messages.js';
export class OpenApiSchemaNotFoundError extends Error {
	constructor() {
		super(messages.OPENAPI_SCHEMA_NOT_FOUND_ERROR_MSG);
		this.name = 'OpenApiSchemaNotFoundError';
	}
}

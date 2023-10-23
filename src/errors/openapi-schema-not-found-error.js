const OPENAPI_SCHEMA_NOT_FOUND_ERROR_MSG = 'No OpenAPI schema found in the given directory';

export class OpenApiSchemaNotFoundError extends Error {
	constructor() {
		super(OPENAPI_SCHEMA_NOT_FOUND_ERROR_MSG);
		this.name = 'OpenApiSchemaNotFoundError';
	}
}

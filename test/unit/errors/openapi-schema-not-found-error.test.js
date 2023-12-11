import { OpenApiSchemaNotFoundError } from '../../../src/errors/openapi-schema-not-found-error.js';
import { expect } from 'chai';
import { messages } from '../../../src/utils/messages.js';

describe('unit: openapi-schema-not-found-error', () => {
	it('should be an instance of Error', () => {
		const error = new OpenApiSchemaNotFoundError();
		expect(error).to.be.an.instanceOf(Error);
	});

	it('should have the correct name', () => {
		const error = new OpenApiSchemaNotFoundError();
		expect(error.name).to.equal('OpenApiSchemaNotFoundError');
	});

	it('should have the correct error message', () => {
		const error = new OpenApiSchemaNotFoundError();
		expect(error.message).to.equal(messages.OPENAPI_SCHEMA_NOT_FOUND_ERROR_MSG);
	});
});

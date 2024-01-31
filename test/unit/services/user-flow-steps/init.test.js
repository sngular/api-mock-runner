import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { globalMocksFactory } from '../../../helpers/global-mocks-factory.js';

use(chaiAsPromised);
use(sinonChai);
const sandbox = createSandbox();

const getOrigin = sandbox.stub();
const getSchemas = sandbox.stub();
const askForPorts = sandbox.stub();
const saveRuntimeConfig = sandbox.stub();
const checkbox = sandbox.stub();
class Logger {
	static error = sandbox.stub();
	static info = sandbox.stub();
}
class OpenApiSchemaNotFoundError extends Error {}
const addToGitignore = sandbox.stub();

const mocks = {
	'@inquirer/checkbox': checkbox,
	'../../helpers/logger.js': { Logger },
	'../../errors/openapi-schema-not-found-error.js': { OpenApiSchemaNotFoundError },
	'../../services/user-flow-steps/helpers.js': { getOrigin, getSchemas, askForPorts, saveRuntimeConfig },
	'../../services/gitignore.js': { addToGitignore },
};
const globalMocks = globalMocksFactory(sandbox);
const fileToTest = '../../../../src/services/user-flow-steps/init.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { init } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

describe('unit: user-flow-steps', () => {
	let consoleLogStub;
	const remoteOrigin = 'git@example.git';
	const localSchema = {
		filename: 'oas.yml',
		path: '/path/to/',
		filePath: '/path/to/oas.yml',
		port: 1234,
		nextPort: 1235,
	};
	const expectedConfigMock = {
		schemasOrigin: '/path/to/',
		selectedSchemas: [{ path: '/path/to/oas.yml', port: 1234 }],
	};

	before(() => {
		consoleLogStub = sandbox.stub(console, 'log');
	});
	after(() => {
		consoleLogStub.restore();
	});
	afterEach(() => {
		sandbox.reset();
	});

	describe('init', () => {
		it('should throw OpenApiSchemaNotFoundError if no schemas are found with remote origin', async () => {
			getOrigin.resolves(remoteOrigin);
			getSchemas.resolves([]);
			await expect(init()).to.be.rejectedWith(OpenApiSchemaNotFoundError);
		});

		it('should throw OpenApiSchemaNotFoundError if no schemas are found with local origin', async () => {
			getOrigin.resolves(localSchema.filePath);
			getSchemas.resolves([]);
			await expect(init()).to.be.rejectedWith(OpenApiSchemaNotFoundError);
		});

		it('should return the config using local available paths', async () => {
			getSchemas.resolves([localSchema]);
			const config = await init({
				origin: localSchema.path,
				schemaPaths: [localSchema.filePath],
				ports: [1234],
			});
			expect(config).to.deep.equal(expectedConfigMock);
		});

		it('should return the config using local origin only', async () => {
			getSchemas.resolves([localSchema]);
			checkbox.resolves([localSchema.filePath]);
			askForPorts.resolves([{ path: localSchema.filePath, port: localSchema.port }]);
			const config = await init({
				origin: localSchema.path,
				port: [],
				schemaPaths: [],
			});
			expect(config).to.deep.equal(expectedConfigMock);
		});
		it('should save runtime config', async () => {
			getSchemas.resolves([localSchema]);
			await init({
				origin: localSchema.path,
				schemaPaths: [localSchema.filePath],
				ports: [1234],
			});
			expect(saveRuntimeConfig).to.have.been.calledOnceWithExactly(expectedConfigMock);
		});
	});
});

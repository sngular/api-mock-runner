import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox, match } from 'sinon';
import sinonChai from 'sinon-chai';

import { messages } from '../../../src/helpers/messages.js';
import { globalMocksFactory } from '../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

const init = sandbox.stub();
const validateStub = sandbox.stub();
const mockStub = sandbox.stub();
class Logger {
	static warn = sandbox.stub();
	static emptyLine = sandbox.stub();
}
const opeApiMocker = sandbox.spy(
	class {
		constructor(options) {
			this.options = options;
			this.validate = validateStub;
			this.mock = mockStub;
		}
	}
);

const mocks = {
	'@sngular/open-api-mocker': { default: opeApiMocker },
	'../helpers/logger.js': { Logger },
	'../services/user-flow-steps/init.js': { init },
};
const globalMocks = globalMocksFactory(sandbox);
const { fs } = globalMocks;
const fileToTest = '../../../src/services/start-mock-server.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { startMockServer } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

describe('unit: start-mock-server', () => {
	afterEach(() => {
		sandbox.reset();
	});

	it('should start a mock server with valid schemas', async () => {
		const schemas = [
			{ port: 3000, path: '/path/to/schema' },
			{ port: 4000, path: '/anotherpath/to/schema' },
		];
		fs.existsSync.returns(true);
		await startMockServer(schemas);
		expect(opeApiMocker).to.have.been.calledWith(
			match({
				port: 3000,
				schema: '/path/to/schema',
			})
		);
		expect(opeApiMocker).to.have.been.calledWith(
			match({
				port: 4000,
				schema: '/anotherpath/to/schema',
			})
		);
		expect(validateStub).to.have.been.calledTwice;
		expect(mockStub).to.have.been.calledTwice;
		expect(Logger.emptyLine).to.have.been.calledTwice;
	});

	it('should init user flow when some schemas do not exist', async () => {
		const schemas = [{ port: 3000, path: '/path/to/schema' }];
		fs.existsSync.returns(false);
		init.resolves({ selectedSchemas: schemas });
		await startMockServer(schemas);
		expect(opeApiMocker).to.have.been.calledWith(
			match({
				port: 3000,
				schema: '/path/to/schema',
			})
		);
		expect(init).to.have.been.calledOnce;
		expect(validateStub).to.have.been.calledOnce;
		expect(mockStub).to.have.been.calledOnce;
		expect(Logger.emptyLine).to.have.been.calledOnce;
		expect(Logger.warn).to.have.been.calledOnceWithExactly(messages.SOME_SCHEMA_DOES_NOT_EXIST);
	});
});

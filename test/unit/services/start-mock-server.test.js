import { expect, use } from 'chai';
import { stub, spy, match } from 'sinon';
import sinonChai from 'sinon-chai';
import fs from 'fs';
import esmock from 'esmock';
import Logger from '../../../src/utils/logger.js';
import { messages } from '../../../src/utils/messages.js';
import { userFlowSteps } from '../../../src/services/user-flow-steps.js';

use(sinonChai);

let validateStub = stub();
let mockStub = stub();
class FakeOpenApiMocker {
	constructor(options) {
		this.options = options;
		this.validate = validateStub;
		this.mock = mockStub;
	}
}
let fakeOpenApiMockerSpy = spy(FakeOpenApiMocker);
const { startMockServer } = await esmock('../../../src/services/start-mock-server.js', import.meta.url, {
	'@os3/open-api-mocker': {
		default: fakeOpenApiMockerSpy,
	},
});

describe('unit: start-mock-server', () => {
	let fsExistsSyncStub;
	let initStub;
	let loggerEmptyLineStub;
	let loggerWarnStub;

	beforeEach(() => {
		fsExistsSyncStub = stub(fs, 'existsSync');
		initStub = stub(userFlowSteps, 'init');
		loggerEmptyLineStub = stub(Logger, 'emptyLine');
		loggerWarnStub = stub(Logger, 'warn');
	});

	afterEach(() => {
		fakeOpenApiMockerSpy.resetHistory();
		validateStub.resetHistory();
		mockStub.resetHistory();
		fsExistsSyncStub.restore();
		initStub.restore();
		loggerEmptyLineStub.restore();
		loggerWarnStub.restore();
	});

	it('should start a mock server with valid schemas', async () => {
		const schemas = [
			{ port: 3000, path: '/path/to/schema' },
			{ port: 4000, path: '/anotherpath/to/schema' },
		];
		fsExistsSyncStub.returns(true);
		await startMockServer.run(schemas);
		expect(fakeOpenApiMockerSpy).to.have.been.calledWith(
			match({
				port: 3000,
				schema: '/path/to/schema',
			})
		);
		expect(fakeOpenApiMockerSpy).to.have.been.calledWith(
			match({
				port: 4000,
				schema: '/anotherpath/to/schema',
			})
		);
		expect(validateStub).to.have.been.calledTwice;
		expect(mockStub).to.have.been.calledTwice;
		expect(loggerEmptyLineStub).to.have.been.calledTwice;
	});

	it('should init user flow when some schemas do not exist', async () => {
		const schemas = [{ port: 3000, path: '/path/to/schema' }];
		fsExistsSyncStub.returns(false);
		initStub.resolves({ selectedSchemas: schemas });
		await startMockServer.run(schemas);
		expect(fakeOpenApiMockerSpy).to.have.been.calledWith(
			match({
				port: 3000,
				schema: '/path/to/schema',
			})
		);
		expect(initStub).to.have.been.calledOnce;
		expect(validateStub).to.have.been.calledOnce;
		expect(mockStub).to.have.been.calledOnce;
		expect(loggerEmptyLineStub).to.have.been.calledOnce;
		expect(loggerWarnStub).to.have.been.calledOnceWithExactly(messages.SOME_SCHEMA_DOES_NOT_EXIST);
	});
});

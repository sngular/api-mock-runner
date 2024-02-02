import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { globalMocksFactory } from '../../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

const confirm = sandbox.stub();
class Logger {
	static info = sandbox.stub();
}
const init = sandbox.stub();
const getConfigFromFile = sandbox.stub();

const mocks = {
	'@inquirer/confirm': confirm,
	'../../helpers/logger.js': { Logger },
	'../../helpers/config-file.js': { getConfigFromFile },
	'../../services/user-flow-steps/init.js': { init },
};
const globalMocks = globalMocksFactory(sandbox);
const fileToTest = '../../../../src/services/user-flow-steps/init-with-config-file.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { initWithConfigFile } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

describe('unit: user-flow-steps', () => {
	let consoleLogStub;
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

	describe('initWithConfigFile', () => {
		it('should init with config file', async () => {
			getConfigFromFile.returns(expectedConfigMock);
			confirm.resolves(true);
			const config = await initWithConfigFile();
			expect(config).to.deep.equal(expectedConfigMock);
		});

		it('should not init with config file and start a new user flow', async () => {
			getConfigFromFile.returns(expectedConfigMock);
			confirm.resolves(false);
			await initWithConfigFile();
			expect(init).to.have.been.calledOnceWithExactly();
		});

		it("should start a new user flow config doesn't exist", async () => {
			getConfigFromFile.returns(null);
			await initWithConfigFile();
			expect(init).to.have.been.calledOnceWithExactly();
		});
	});
});

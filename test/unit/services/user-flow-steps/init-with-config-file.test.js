import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { globalMocksFactory } from '../../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

const init = sandbox.stub();
const confirm = sandbox.stub();
class Logger {
	static info = sandbox.stub();
}

const mocks = {
	'@inquirer/prompts': { confirm },
	'../../helpers/logger.js': { Logger },
	'../../services/user-flow-steps/init.js': { init },
};
const globalMocks = globalMocksFactory(sandbox);
const { fs } = globalMocks;
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
			fs.readFileSync.returns(JSON.stringify(expectedConfigMock));
			confirm.resolves(true);
			const config = await initWithConfigFile();
			expect(config).to.deep.equal(expectedConfigMock);
		});

		it('should not init with config file and start a new user flow', async () => {
			fs.readFileSync.returns(JSON.stringify(expectedConfigMock));
			confirm.resolves(false);
			await initWithConfigFile();
			expect(init).to.have.been.calledOnceWithExactly();
		});
	});
});

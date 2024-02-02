import { expect, use } from 'chai';
import { program } from 'commander';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { globalMocksFactory } from '../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

class Logger {
	static warn = sandbox.stub();
}
const configFileExists = sandbox.stub();
const getConfigFromFile = sandbox.stub();
const cloneRepository = sandbox.stub();
const findOasFromDir = sandbox.stub();
const findOasFromDirRecursive = sandbox.stub();
const addToGitignore = sandbox.stub();
const init = sandbox.stub();
const initWithSchemaPaths = sandbox.stub();
const initWithConfigFile = sandbox.stub();
const startMockServer = sandbox.stub();

const mocks = {
	'./helpers/logger.js': { Logger },
	'./helpers/config-file.js': { configFileExists, getConfigFromFile },
	'./services/user-flow-steps/init.js': { init },
	'./services/user-flow-steps/init-with-schema-paths.js': { initWithSchemaPaths },
	'./services/user-flow-steps/init-with-config-file.js': { initWithConfigFile },
	'./services/start-mock-server.js': { startMockServer },
	'./services/clone-git-repository.js': { cloneRepository },
	'./services/find-oas-from-dir.js': { findOasFromDir, findOasFromDirRecursive },
	'./services/gitignore.js': { addToGitignore },
};
const globalMocks = globalMocksFactory(sandbox);
const fileToTest = '../../src/main.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { main } = await esmock(absolutePath, absolutePath, mocks, globalMocks);
describe('unit: main', () => {
	const expectedConfigMock = {
		schemasOrigin: '/path/to/',
		selectedSchemas: [{ path: '/path/to/oas.yml', port: 1234 }],
	};
	const origin = '/path/to/';
	const schema = '/path/to/oas.yml';

	before(() => {
		sandbox.stub(program, 'opts');
		sandbox.stub(program, 'parse');
	});

	after(() => {
		sandbox.restore();
	});

	afterEach(() => {
		sandbox.reset();
	});

	it('should init user flow and start the mock server using runConfig flag and config file does not exist', async () => {
		program.opts.returns({ runConfig: true });
		getConfigFromFile.returns(null);
		init.resolves(expectedConfigMock);
		await main();
		expect(init).to.have.been.calledOnceWithExactly();
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should start the mock server using runConfig flag and config file exist', async () => {
		program.opts.returns({ runConfig: true });
		getConfigFromFile.returns(expectedConfigMock);
		await main();
		expect(init).to.have.not.been.called;
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow using origin flag and start the mock server', async () => {
		program.opts.returns({ origin });
		init.resolves(expectedConfigMock);
		await main();
		expect(init).to.have.been.calledOnceWithExactly({
			origin,
			ports: undefined,
			schemaPaths: undefined,
		});
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow using schema flag and start the mock server', async () => {
		program.opts.returns({ schema });
		initWithSchemaPaths.resolves(expectedConfigMock);
		await main();
		expect(initWithSchemaPaths).to.have.been.calledOnceWithExactly({
			schemaPaths: schema,
			ports: undefined,
		});
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow using config file only', async () => {
		program.opts.returns({});
		configFileExists.returns(true);
		initWithConfigFile.resolves(expectedConfigMock);
		await main();
		expect(initWithConfigFile).to.have.been.calledOnceWithExactly();
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow on no config file and no flags', async () => {
		program.opts.returns({});
		configFileExists.returns(false);
		init.resolves(expectedConfigMock);
		await main();
		expect(init).to.have.been.calledOnceWithExactly();
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});
});

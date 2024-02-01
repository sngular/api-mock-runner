import { expect, use } from 'chai';
import { program } from 'commander';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { RC_FILE_NAME } from '../../src/helpers/constants.js';
import { messages } from '../../src/helpers/messages.js';
import { globalMocksFactory } from '../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

class Logger {
	static warn = sandbox.stub();
}
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
	'./services/user-flow-steps/init.js': { init },
	'./services/user-flow-steps/init-with-schema-paths.js': { initWithSchemaPaths },
	'./services/user-flow-steps/init-with-config-file.js': { initWithConfigFile },
	'./services/start-mock-server.js': { startMockServer },
	'./services/clone-git-repository.js': { cloneRepository },
	'./services/find-oas-from-dir.js': { findOasFromDir, findOasFromDirRecursive },
	'./services/gitignore.js': { addToGitignore },
};
const globalMocks = globalMocksFactory(sandbox);
const { fs } = globalMocks;
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
		fs.existsSync.returns(false);
		init.resolves(expectedConfigMock);
		await main();
		expect(program.parse).to.have.been.calledOnce;
		expect(program.opts).to.have.been.calledOnce;
		expect(fs.existsSync).to.have.been.calledOnce;
		expect(Logger.warn).to.have.been.calledWith(messages.CONFIG_FILE_NOT_FOUND, RC_FILE_NAME);
		expect(init).to.have.been.calledOnceWithExactly();
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should start the mock server using runConfig flag and config file exist', async () => {
		program.opts.returns({ runConfig: true });
		fs.existsSync.returns(true);
		fs.readFileSync.returns(JSON.stringify(expectedConfigMock));
		await main();
		expect(program.parse).to.have.been.calledOnce;
		expect(program.opts).to.have.been.calledOnce;
		expect(fs.existsSync).to.have.been.calledOnce;
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow using origin flag and start the mock server', async () => {
		program.opts.returns({ origin });
		fs.existsSync.returns(true);
		fs.readFileSync.returns(JSON.stringify(expectedConfigMock));
		init.resolves(expectedConfigMock);
		await main();
		expect(program.parse).to.have.been.calledOnce;
		expect(program.opts).to.have.been.calledOnce;
		expect(fs.existsSync).to.have.been.calledOnce;
		expect(init).to.have.been.calledOnceWithExactly({
			origin,
			ports: undefined,
			schemaPaths: undefined,
		});
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow using schema flag and start the mock server', async () => {
		program.opts.returns({ schema });
		fs.existsSync.returns(true);
		fs.readFileSync.returns(JSON.stringify(expectedConfigMock));
		initWithSchemaPaths.resolves(expectedConfigMock);
		await main();
		expect(program.parse).to.have.been.calledOnce;
		expect(program.opts).to.have.been.calledOnce;
		expect(fs.existsSync).to.have.been.calledOnce;
		expect(initWithSchemaPaths).to.have.been.calledOnceWithExactly({
			schemaPaths: schema,
			ports: undefined,
		});
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow using config file only', async () => {
		program.opts.returns({});
		fs.existsSync.returns(true);
		fs.readFileSync.returns(JSON.stringify(expectedConfigMock));
		initWithConfigFile.resolves(expectedConfigMock);
		await main();
		expect(program.parse).to.have.been.calledOnce;
		expect(program.opts).to.have.been.calledOnce;
		expect(fs.existsSync).to.have.been.calledOnce;
		expect(initWithConfigFile).to.have.been.calledOnceWithExactly();
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow on no config file and no flags', async () => {
		program.opts.returns({});
		fs.existsSync.returns(false);
		fs.readFileSync.returns(JSON.stringify(expectedConfigMock));
		init.resolves(expectedConfigMock);
		await main();
		expect(program.parse).to.have.been.calledOnce;
		expect(program.opts).to.have.been.calledOnce;
		expect(fs.existsSync).to.have.been.calledOnce;
		expect(init).to.have.been.calledOnceWithExactly();
		expect(startMockServer).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});
});

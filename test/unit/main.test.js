import { expect, use } from 'chai';
import { program } from 'commander';
import fs from 'node:fs';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

import { main } from '../../src/main.js';
import { startMockServer } from '../../src/services/start-mock-server.js';
import { userFlowSteps } from '../../src/services/user-flow-steps.js';
import { RC_FILE_NAME } from '../../src/services/utils.js';
import Logger from '../../src/utils/logger.js';
import { messages } from '../../src/utils/messages.js';

use(sinonChai);

describe('unit: index', () => {
	let commanderOptsStub;
	let commanderParseStub;
	let fsExistsSyncStub;
	let fsReadFileSyncStub;
	let loggerWarnStub;
	let userFlowStepsInitStub;
	let userFlowStepsInitWithSchemaPathsStub;
	let userFlowStepsInitWithConfigFileStub;
	let startMockServerRunStub;

	const expectedConfigMock = {
		schemasOrigin: '/path/to/',
		selectedSchemas: [{ path: '/path/to/oas.yml', port: 1234 }],
	};
	const origin = '/path/to/';
	const schema = '/path/to/oas.yml';

	beforeEach(() => {
		commanderOptsStub = stub(program, 'opts');
		commanderParseStub = stub(program, 'parse');
		fsExistsSyncStub = stub(fs, 'existsSync');
		fsReadFileSyncStub = stub(fs, 'readFileSync');
		loggerWarnStub = stub(Logger, 'warn');
		userFlowStepsInitStub = stub(userFlowSteps, 'init');
		userFlowStepsInitWithSchemaPathsStub = stub(userFlowSteps, 'initWithSchemaPaths');
		userFlowStepsInitWithConfigFileStub = stub(userFlowSteps, 'initWithConfigFile');
		startMockServerRunStub = stub(startMockServer, 'run');
	});

	afterEach(() => {
		commanderOptsStub.restore();
		commanderParseStub.restore();
		fsExistsSyncStub.restore();
		fsReadFileSyncStub.restore();
		loggerWarnStub.restore();
		userFlowStepsInitStub.restore();
		userFlowStepsInitWithSchemaPathsStub.restore();
		userFlowStepsInitWithConfigFileStub.restore();
		startMockServerRunStub.restore();
	});

	it('should init user flow and start the mock server using runConfig flag and config file does not exist', async () => {
		commanderOptsStub.returns({ runConfig: true });
		fsExistsSyncStub.returns(false);
		userFlowStepsInitStub.resolves(expectedConfigMock);
		await main();
		expect(commanderParseStub).to.have.been.calledOnce;
		expect(commanderOptsStub).to.have.been.calledOnce;
		expect(fsExistsSyncStub).to.have.been.calledOnce;
		expect(loggerWarnStub).to.have.been.calledWith(messages.CONFIG_FILE_NOT_FOUND, RC_FILE_NAME);
		expect(userFlowStepsInitStub).to.have.been.calledOnceWithExactly();
		expect(startMockServerRunStub).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should start the mock server using runConfig flag and config file exist', async () => {
		commanderOptsStub.returns({ runConfig: true });
		fsExistsSyncStub.returns(true);
		fsReadFileSyncStub.returns(JSON.stringify(expectedConfigMock));
		await main();
		expect(commanderParseStub).to.have.been.calledOnce;
		expect(commanderOptsStub).to.have.been.calledOnce;
		expect(fsExistsSyncStub).to.have.been.calledOnce;
		expect(startMockServerRunStub).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow using origin flag and start the mock server', async () => {
		commanderOptsStub.returns({ origin });
		fsExistsSyncStub.returns(true);
		fsReadFileSyncStub.returns(JSON.stringify(expectedConfigMock));
		userFlowStepsInitStub.resolves(expectedConfigMock);
		await main();
		expect(commanderParseStub).to.have.been.calledOnce;
		expect(commanderOptsStub).to.have.been.calledOnce;
		expect(fsExistsSyncStub).to.have.been.calledOnce;
		expect(userFlowStepsInitStub).to.have.been.calledOnceWithExactly({
			origin,
			ports: undefined,
			schemaPaths: undefined,
		});
		expect(startMockServerRunStub).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow using schema flag and start the mock server', async () => {
		commanderOptsStub.returns({ schema });
		fsExistsSyncStub.returns(true);
		fsReadFileSyncStub.returns(JSON.stringify(expectedConfigMock));
		userFlowStepsInitWithSchemaPathsStub.resolves(expectedConfigMock);
		await main();
		expect(commanderParseStub).to.have.been.calledOnce;
		expect(commanderOptsStub).to.have.been.calledOnce;
		expect(fsExistsSyncStub).to.have.been.calledOnce;
		expect(userFlowStepsInitWithSchemaPathsStub).to.have.been.calledOnceWithExactly({
			schemaPaths: schema,
			ports: undefined,
		});
		expect(startMockServerRunStub).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow using config file only', async () => {
		commanderOptsStub.returns({});
		fsExistsSyncStub.returns(true);
		fsReadFileSyncStub.returns(JSON.stringify(expectedConfigMock));
		userFlowStepsInitWithConfigFileStub.resolves(expectedConfigMock);
		await main();
		expect(commanderParseStub).to.have.been.calledOnce;
		expect(commanderOptsStub).to.have.been.calledOnce;
		expect(fsExistsSyncStub).to.have.been.calledOnce;
		expect(userFlowStepsInitWithConfigFileStub).to.have.been.calledOnceWithExactly();
		expect(startMockServerRunStub).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});

	it('should init user flow on no config file and no flags', async () => {
		commanderOptsStub.returns({});
		fsExistsSyncStub.returns(false);
		fsReadFileSyncStub.returns(JSON.stringify(expectedConfigMock));
		userFlowStepsInitStub.resolves(expectedConfigMock);
		await main();
		expect(commanderParseStub).to.have.been.calledOnce;
		expect(commanderOptsStub).to.have.been.calledOnce;
		expect(fsExistsSyncStub).to.have.been.calledOnce;
		expect(userFlowStepsInitStub).to.have.been.calledOnceWithExactly();
		expect(startMockServerRunStub).to.have.been.calledOnceWithExactly(expectedConfigMock.selectedSchemas);
	});
});

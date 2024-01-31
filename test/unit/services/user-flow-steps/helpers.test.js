import { expect, use } from 'chai';
import esmock from 'esmock';
import { URL } from 'node:url';
import { createSandbox, match } from 'sinon';
import sinonChai from 'sinon-chai';

import { RC_FILE_NAME, TEMP_FOLDER_NAME } from '../../../../src/helpers/constants.js';
import { messages } from '../../../../src/helpers/messages.js';
import { globalMocksFactory } from '../../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

const input = sandbox.stub();
class Logger {
	static info = sandbox.stub();
}
const verifyRemoteOrigin = sandbox.stub();
const cloneRepository = sandbox.stub();
const findOasFromDir = sandbox.stub();
const findOasFromDirRecursive = sandbox.stub();
const addToGitignore = sandbox.stub();
const portValidator = sandbox.stub();
const originValidator = sandbox.stub();

const mocks = {
	'@inquirer/input': input,
	'../../helpers/logger.js': { Logger },
	'../../helpers/verify-remote-origin.js': { verifyRemoteOrigin },
	'../clone-git-repository.js': { cloneRepository },
	'../find-oas-from-dir.js': { findOasFromDir, findOasFromDirRecursive },
	'../gitignore.js': { addToGitignore },
	'../inquirer-validators.js': { portValidator, originValidator },
};
const globalMocks = globalMocksFactory(sandbox);
const { path } = globalMocks;
const fileToTest = '../../../../src/services/user-flow-steps/helpers.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { getSchemas, getOrigin, askForPorts, assignPorts, saveRuntimeConfig } = await esmock(
	absolutePath,
	absolutePath,
	mocks,
	globalMocks
);

describe('unit: user-flow-steps', () => {
	afterEach(() => {
		sandbox.reset();
	});

	describe('helpers', () => {
		describe('getSchemas', () => {
			const expectedSchemas = [{ path: 'test', port: 3000 }];
			it('should find schemas from the local origin', async () => {
				verifyRemoteOrigin.returns(false);
				findOasFromDir.returns(expectedSchemas);
				const schemas = await getSchemas('localOrigin');
				expect(cloneRepository).to.not.have.been.called;
				expect(addToGitignore).to.not.have.been.called;
				expect(findOasFromDir).to.have.been.calledOnce;
				expect(schemas).to.deep.equal(expectedSchemas);
			});

			it('should clone the repository if the origin is remote', async () => {
				verifyRemoteOrigin.returns(true);
				findOasFromDirRecursive.returns(expectedSchemas);
				const schemas = await getSchemas('remoteOrigin');
				expect(cloneRepository).to.have.been.calledOnce;
				expect(addToGitignore).to.have.been.calledOnce;
				expect(findOasFromDirRecursive).to.have.been.calledOnce;
				expect(schemas).to.deep.equal(expectedSchemas);
			});

			it('should clone repository in the temp folder', async () => {
				verifyRemoteOrigin.returns(true);
				await getSchemas('remoteOrigin');
				expect(cloneRepository).to.have.been.calledWith('remoteOrigin', TEMP_FOLDER_NAME);
			});
		});

		describe('getOrigin', () => {
			it('should return the local origin provided by the user', async () => {
				const userInput = 'localOrigin';
				const expectedOrigin = '/absolutePath/localOrigin';
				input.resolves(userInput);
				verifyRemoteOrigin.returns(false);
				path.resolve.returns(expectedOrigin);
				const origin = await getOrigin();
				expect(origin).to.equal(expectedOrigin);
			});

			it('should return the remote origin provided by the user', async () => {
				const userInput = 'remoteOrigin';
				const expectedOrigin = 'remoteOrigin';
				input.resolves(userInput);
				verifyRemoteOrigin.returns(true);
				const origin = await getOrigin();
				expect(origin).to.equal(expectedOrigin);
			});
		});

		describe('askForPorts', () => {
			it('should return the schemas with the assigned ports', async () => {
				const schemas = ['test1', 'test2'];
				const expectedSchemas = [
					{ path: 'test1', port: 1111 },
					{ path: 'test2', port: 2222 },
				];
				input.onCall(0).resolves('1111').onCall(1).resolves('2222');
				portValidator.returns(true);
				const result = await askForPorts(schemas);
				expect(result).to.deep.equal(expectedSchemas);
			});
			it('should suggest default port on input request', async () => {
				const schemas = ['test1', 'test2'];
				portValidator.returns(true);
				await askForPorts(schemas);
				expect(input).to.have.been.calledWithMatch({ default: '1234' });
			});
			it('should suggest next port number of previous enter one', async () => {
				const schemas = ['test1', 'test2'];
				portValidator.returns(true);
				input.onCall(0).resolves('1111');
				await askForPorts(schemas);
				expect(input.firstCall).to.have.been.calledWithMatch({ default: '1234' });
				expect(input.secondCall).to.have.been.calledWithMatch({ default: '1112' });
			});
			it('should use global message', async () => {
				const schemas = ['test1'];
				portValidator.returns(true);
				await askForPorts(schemas);
				expect(input).to.have.been.calledWithMatch({ message: messages.INPUT_PORT('test1') });
			});
		});
		describe('assignPorts', () => {
			it('should use the provided ports if length match', async () => {
				const schemas = ['test1', 'test2'];
				const ports = ['1111', '2222'];
				const expectedSchemas = [
					{ path: 'test1', port: 1111 },
					{ path: 'test2', port: 2222 },
				];
				const result = await assignPorts(schemas, ports);
				expect(result).to.deep.equal(expectedSchemas);
			});
			it('should autocomplete ports if length mismatch', async () => {
				const schemas = ['test1', 'test2'];
				const ports = ['1111'];
				const expectedSchemas = [
					{ path: 'test1', port: 1111 },
					{ path: 'test2', port: 1112 },
				];
				const result = await assignPorts(schemas, ports);
				expect(result).to.deep.equal(expectedSchemas);
			});
			it('should autocomplete ports if no port provided', async () => {
				const schemas = ['test1', 'test2'];
				const ports = undefined;
				const expectedSchemas = [
					{ path: 'test1', port: 1234 },
					{ path: 'test2', port: 1235 },
				];
				const result = await assignPorts(schemas, ports);
				expect(result).to.deep.equal(expectedSchemas);
			});
		});
		describe('saveRuntimeConfig', () => {
			it('should save the config', async () => {
				const config = { test: 'test' };
				const rcFilePath = `path/to/${RC_FILE_NAME}`;
				path.join.returns(rcFilePath);
				await saveRuntimeConfig(config);
				expect(globalMocks.fs.writeFileSync).to.have.been.calledWithMatch(rcFilePath, match.string);
				expect(Logger.info).to.have.been.calledWithMatch(messages.SAVED_CONFIG(RC_FILE_NAME), config);
				expect(addToGitignore).to.have.been.called;
			});
		});
	});
});

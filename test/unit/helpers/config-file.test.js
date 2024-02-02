import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { RC_FILE_NAME } from '../../../src/helpers/constants.js';
import { messages } from '../../../src/helpers/messages.js';
import { globalMocksFactory } from '../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

class Logger {
	static info = sandbox.stub();
	static warn = sandbox.stub();
	static error = sandbox.stub();
}

const mocks = {
	'./logger.js': { Logger },
};
const globalMocks = globalMocksFactory(sandbox);
const { fs, path } = globalMocks;
const fileToTest = '../../../src/helpers/config-file.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { getConfigFromFile, saveConfigToFile } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

describe('unit: config-file', () => {
	afterEach(() => {
		sandbox.reset();
	});

	describe('getConfigFromFile', () => {
		it('should return null if the config file does not exist', () => {
			expect(getConfigFromFile()).to.be.null;
			expect(Logger.warn).to.have.been.calledOnceWithExactly(messages.CONFIG_FILE_NOT_FOUND, RC_FILE_NAME);
		});

		it('should return null if the config file is invalid', () => {
			fs.existsSync.returns(true);
			fs.readFileSync.returns('invalid json');
			expect(getConfigFromFile()).to.be.null;
			expect(Logger.error).to.have.been.calledOnceWithExactly(messages.CONFIG_FILE_INVALID(RC_FILE_NAME));
		});

		it('should return null if the config file is null', () => {
			fs.existsSync.returns(true);
			fs.readFileSync.returns(null);
			expect(getConfigFromFile()).to.be.null;
		});

		it('should return the config object', () => {
			const config = { foo: 'bar' };
			fs.existsSync.returns(true);
			fs.readFileSync.returns(JSON.stringify(config));
			expect(getConfigFromFile()).to.deep.equal(config);
		});
	});

	describe('saveConfigToFile', () => {
		it('should write the config to the file', () => {
			const configFilePath = '/path/to/config/file';
			const config = { foo: 'bar' };
			path.join.returns(configFilePath);
			saveConfigToFile(config);
			expect(fs.writeFileSync).to.have.been.calledOnceWithExactly(configFilePath, JSON.stringify(config, null, '\t'));
			expect(Logger.info).to.have.been.calledOnceWithExactly(messages.SAVED_CONFIG(RC_FILE_NAME), config);
		});
	});
});

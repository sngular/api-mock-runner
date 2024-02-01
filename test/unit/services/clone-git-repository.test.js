import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { globalMocksFactory } from '../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

const mocks = {};
const globalMocks = globalMocksFactory(sandbox);
const { fs, child_process } = globalMocks;
const fileToTest = '../../../src/services/clone-git-repository.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { cloneRepository } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

use(sinonChai);

describe('unit: clone-git-repository mocking git clone and fs I/O', () => {
	const dirName = '';
	const repositoryURL = '';

	afterEach(() => {
		sandbox.reset();
	});

	it('should reset temp dir and clone repository', () => {
		fs.existsSync.returns(true);
		cloneRepository(repositoryURL, dirName);
		expect(fs.existsSync).to.have.been.called;
		expect(fs.rmSync).to.have.been.called;
		expect(fs.mkdirSync).to.have.been.called;
		expect(child_process.execSync).to.have.been.called;
	});

	it('should create temp dir and clone repository', () => {
		fs.existsSync.returns(false);
		cloneRepository(repositoryURL, dirName);
		expect(fs.existsSync).to.have.been.called;
		expect(fs.rmSync).to.not.have.been.called;
		expect(fs.mkdirSync).to.have.been.called;
		expect(child_process.execSync).to.have.been.called;
	});
});

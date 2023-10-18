import { expect, use } from 'chai';
import child_process from 'child_process';
import fs from 'fs';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
import cloneGitRepository from '../../../src/services/clone-git-repository.js';

use(sinonChai);

describe('unit:clone-git-repository mocking git clone and fs I/O', () => {
	const dirName = '';
	const repositoryURL = '';
	let execSyncStub;
	let existsSyncStub;
	let mkdirSyncStub;
	let rmSync;

	beforeEach(() => {
		execSyncStub = stub(child_process, 'execSync');
		existsSyncStub = stub(fs, 'existsSync');
		mkdirSyncStub = stub(fs, 'mkdirSync');
		rmSync = stub(fs, 'rmSync');
	});

	afterEach(() => {
		execSyncStub.restore();
		existsSyncStub.restore();
		mkdirSyncStub.restore();
		rmSync.restore();
	});

	it('should reset temp dir and clone repository', () => {
		existsSyncStub.returns(true);
		cloneGitRepository(repositoryURL, dirName);
		expect(existsSyncStub).to.have.been.called;
		expect(rmSync).to.have.been.called;
		expect(mkdirSyncStub).to.have.been.called;
		expect(execSyncStub).to.have.been.called;
	});

	it('should create temp dir and clone repository', () => {
		existsSyncStub.returns(false);
		cloneGitRepository(repositoryURL, dirName);
		expect(existsSyncStub).to.have.been.called;
		expect(rmSync).to.not.have.been.called; // not called
		expect(mkdirSyncStub).to.have.been.called;
		expect(execSyncStub).to.have.been.called;
	});
});

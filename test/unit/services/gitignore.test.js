import { expect, use } from 'chai';
import fs from 'node:fs';
import { restore, stub } from 'sinon';
import sinonChai from 'sinon-chai';
import { checkStringInFile } from '../../../src/services/check-string-in-file.js';
import { cli } from '../../../src/services/cli.js';
import addToGitignore, { GITIGNORE_PATH } from '../../../src/services/gitignore.js';
use(sinonChai);

describe('unit:addToGitignore', () => {
	const gitignoreContentNoNewline = 'fileContentTest';
	const fileNameTest = 'fileNameTest';
	const lineToAdd = `${fileNameTest}\n`;
	let appendFileSyncStub;
	let checkStringInFileStub;
	let confirmStub;
	let existsSyncStub;
	let readFileSyncStub;

	beforeEach(() => {
		appendFileSyncStub = stub(fs, 'appendFileSync');
		checkStringInFileStub = stub(checkStringInFile, 'check');
		confirmStub = stub(cli, 'confirmAddToGitignore');
		existsSyncStub = stub(fs, 'existsSync');
		readFileSyncStub = stub(fs, 'readFileSync');
	});

	afterEach(() => {
		restore();
	});

	it('should not add filename when already is in it', async () => {
		existsSyncStub.returns(true);
		checkStringInFileStub.returns(true);
		await addToGitignore(fileNameTest);
		expect(existsSyncStub).to.have.been.calledWith(GITIGNORE_PATH);
		expect(checkStringInFileStub).to.have.been.calledWith(fileNameTest, GITIGNORE_PATH);
		expect(confirmStub).to.not.have.been.called;
		expect(readFileSyncStub).to.not.have.been.called;
		expect(appendFileSyncStub).to.not.have.been.called;
	});

	it('should not add filename when user refuses', async () => {
		existsSyncStub.returns(false);
		confirmStub.returns(false);
		await addToGitignore(fileNameTest);
		expect(existsSyncStub).to.have.been.called;
		expect(confirmStub).to.have.been.called;
		expect(readFileSyncStub).to.not.have.been.called;
		expect(appendFileSyncStub).to.not.have.been.called;
	});

	it('should add newline and filename to existing .gitignore when user accepts', async () => {
		existsSyncStub.returns(true);
		confirmStub.returns(true);
		readFileSyncStub.returns(gitignoreContentNoNewline);
		await addToGitignore(fileNameTest);
		expect(existsSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH);
		expect(confirmStub).to.have.been.calledOnceWith(fileNameTest);
		expect(readFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, 'utf8');
		expect(appendFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, `\n${lineToAdd}`);
	});

	it('should add filename to existing .gitignore when user accepts', async () => {
		existsSyncStub.returns(true);
		confirmStub.returns(true);
		readFileSyncStub.returns(`${gitignoreContentNoNewline}\n`);
		await addToGitignore(fileNameTest);
		expect(existsSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH);
		expect(confirmStub).to.have.been.calledOnceWith(fileNameTest);
		expect(readFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, 'utf8');
		expect(appendFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, `${lineToAdd}`);
	});

	it('should add filename to missing .gitignore when user accepts', async () => {
		existsSyncStub.returns(false);
		confirmStub.returns(true);
		await addToGitignore(fileNameTest);
		expect(existsSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH);
		expect(confirmStub).to.have.been.calledOnceWith(fileNameTest);
		expect(readFileSyncStub).to.not.have.been.called;
		expect(appendFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, `${lineToAdd}`);
	});
});

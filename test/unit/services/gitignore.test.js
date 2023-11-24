import { expect, use } from 'chai';
import fs from 'node:fs';
import esmock from 'esmock';
import { restore, stub, match } from 'sinon';
import sinonChai from 'sinon-chai';
import { checkStringInFile } from '../../../src/services/check-string-in-file.js';
use(sinonChai);

let confirmStub = stub();
const { default: addToGitignore, GITIGNORE_PATH } = await esmock(
	'../../../src/services/gitignore.js',
	import.meta.url,
	{
		'@inquirer/prompts': {
			confirm: (...args) => confirmStub(...args),
		},
	}
);

describe('unit:addToGitignore', () => {
	const gitignoreContentNoNewline = 'fileContentTest';
	const fileNameTest = 'fileNameTest';
	const lineToAdd = `${fileNameTest}\n`;
	let appendFileSyncStub;
	let checkStringInFileStub;
	let existsSyncStub;
	let readFileSyncStub;

	beforeEach(() => {
		appendFileSyncStub = stub(fs, 'appendFileSync');
		checkStringInFileStub = stub(checkStringInFile, 'check');
		confirmStub = stub();
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
		confirmStub.resolves(false);
		await addToGitignore(fileNameTest);
		expect(existsSyncStub).to.have.been.called;
		expect(confirmStub).to.have.been.called;
		expect(readFileSyncStub).to.not.have.been.called;
		expect(appendFileSyncStub).to.not.have.been.called;
	});

	it('should add newline and filename to existing .gitignore when user accepts', async () => {
		existsSyncStub.returns(true);
		confirmStub.resolves(true);
		readFileSyncStub.returns(gitignoreContentNoNewline);
		await addToGitignore(fileNameTest);
		expect(existsSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH);
		expect(confirmStub).to.have.been.calledOnceWith(match({ message: `Add ${fileNameTest} to .gitignore?` }));
		expect(readFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, 'utf8');
		expect(appendFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, `\n${lineToAdd}`);
	});

	it('should add filename to existing .gitignore when user accepts', async () => {
		existsSyncStub.returns(true);
		confirmStub.returns(true);
		readFileSyncStub.returns(`${gitignoreContentNoNewline}\n`);
		await addToGitignore(fileNameTest);
		expect(existsSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH);
		expect(confirmStub).to.have.been.calledOnceWith(match({ message: `Add ${fileNameTest} to .gitignore?` }));
		expect(readFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, 'utf8');
		expect(appendFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, `${lineToAdd}`);
	});

	it('should add filename to missing .gitignore when user accepts', async () => {
		existsSyncStub.returns(false);
		confirmStub.returns(true);
		await addToGitignore(fileNameTest);
		expect(existsSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH);
		expect(confirmStub).to.have.been.calledOnceWith(match({ message: `Add ${fileNameTest} to .gitignore?` }));
		expect(readFileSyncStub).to.not.have.been.called;
		expect(appendFileSyncStub).to.have.been.calledOnceWith(GITIGNORE_PATH, `${lineToAdd}`);
	});
});

import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox, match } from 'sinon';
import sinonChai from 'sinon-chai';

import { messages } from '../../../src/helpers/messages.js';
import { globalMocksFactory } from '../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();
const confirm = sandbox.stub();
const check = sandbox.stub();

const mocks = {
	'@inquirer/confirm': confirm,
	'../services/check-string-in-file.js': { check },
};
const globalMocks = globalMocksFactory(sandbox);
const { fs } = globalMocks;
const fileToTest = '../../../src/services/gitignore.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { addToGitignore, GITIGNORE_PATH } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

describe('unit: addToGitignore', () => {
	const gitignoreContentNoNewline = 'fileContentTest';
	const fileNameTest = 'fileNameTest';
	const lineToAdd = `${fileNameTest}\n`;

	afterEach(() => {
		sandbox.reset();
	});

	it('should not add filename when already is in it', async () => {
		fs.existsSync.returns(true);
		check.returns(true);
		await addToGitignore(fileNameTest);
		expect(fs.existsSync).to.have.been.calledWith(GITIGNORE_PATH);
		expect(check).to.have.been.calledWith(fileNameTest, GITIGNORE_PATH);
		expect(confirm).to.not.have.been.called;
		expect(fs.readFileSync).to.not.have.been.called;
		expect(fs.appendFileSync).to.not.have.been.called;
	});

	it('should not add filename when user refuses', async () => {
		fs.existsSync.returns(false);
		confirm.resolves(false);
		await addToGitignore(fileNameTest);
		expect(fs.existsSync).to.have.been.called;
		expect(confirm).to.have.been.called;
		expect(fs.readFileSync).to.not.have.been.called;
		expect(fs.appendFileSync).to.not.have.been.called;
	});

	it('should add newline and filename to existing .gitignore when user accepts', async () => {
		fs.existsSync.returns(true);
		confirm.resolves(true);
		fs.readFileSync.returns(gitignoreContentNoNewline);
		await addToGitignore(fileNameTest);
		expect(fs.existsSync).to.have.been.calledOnceWith(GITIGNORE_PATH);
		expect(confirm).to.have.been.calledOnceWith(match({ message: messages.CONFIRM_ADD_TO_GITIGNORE(fileNameTest) }));
		expect(fs.readFileSync).to.have.been.calledOnceWith(GITIGNORE_PATH, 'utf8');
		expect(fs.appendFileSync).to.have.been.calledOnceWith(GITIGNORE_PATH, `\n${lineToAdd}`);
	});

	it('should add filename to existing .gitignore when user accepts', async () => {
		fs.existsSync.returns(true);
		confirm.returns(true);
		fs.readFileSync.returns(`${gitignoreContentNoNewline}\n`);
		await addToGitignore(fileNameTest);
		expect(fs.existsSync).to.have.been.calledOnceWith(GITIGNORE_PATH);
		expect(confirm).to.have.been.calledOnceWith(match({ message: messages.CONFIRM_ADD_TO_GITIGNORE(fileNameTest) }));
		expect(fs.readFileSync).to.have.been.calledOnceWith(GITIGNORE_PATH, 'utf8');
		expect(fs.appendFileSync).to.have.been.calledOnceWith(GITIGNORE_PATH, `${lineToAdd}`);
	});

	it('should add filename to missing .gitignore when user accepts', async () => {
		fs.existsSync.returns(false);
		confirm.returns(true);
		await addToGitignore(fileNameTest);
		expect(fs.existsSync).to.have.been.calledOnceWith(GITIGNORE_PATH);
		expect(confirm).to.have.been.calledOnceWith(match({ message: messages.CONFIRM_ADD_TO_GITIGNORE(fileNameTest) }));
		expect(fs.readFileSync).to.not.have.been.called;
		expect(fs.appendFileSync).to.have.been.calledOnceWith(GITIGNORE_PATH, `${lineToAdd}`);
	});
});

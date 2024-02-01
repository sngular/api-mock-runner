import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { fileContentIterator } from '../../helpers/file-content-iterator.js';
import { globalMocksFactory } from '../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

const mocks = {};
const globalMocks = globalMocksFactory(sandbox);
const { readline } = globalMocks;
const fileToTest = '../../../src/services/check-string-in-file.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { check } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

describe('unit: check-string-in-file', () => {
	const filePath = 'path/to/file.txt';
	const emptyFilePath = 'path/to/empty-file.txt';
	let stringToCheck = 'Hello, World!';

	afterEach(() => {
		sandbox.reset();
	});

	it('should return true if the string exists in the file', async () => {
		readline.createInterface.returns(fileContentIterator(`Text\n${stringToCheck}\nSome other line`));
		const result = await check(stringToCheck, filePath);
		expect(result).to.be.true;
	});

	it('should return false if the string does not exist in the file', async () => {
		readline.createInterface.returns(fileContentIterator(`Text\n${stringToCheck}\nSome other line`));
		const result = await check('wrongStringToCheck', filePath);
		expect(result).to.be.false;
	});

	it('should return false if the file is empty', async () => {
		readline.createInterface.returns(fileContentIterator(''));
		const result = await check(stringToCheck, emptyFilePath);
		expect(result).to.be.false;
	});
});

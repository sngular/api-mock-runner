import { expect, use } from 'chai';
import mockFs from 'mock-fs';
import sinonChai from 'sinon-chai';
import { checkStringInFile } from '../../../src/services/check-string-in-file.js';

use(sinonChai);

describe('unit: check-string-in-file', () => {
	const filePath = 'path/to/file.txt';
	const emptyFilePath = 'path/to/empty-file.txt';
	let stringToCheck = 'Hello, World!';

	before(() => {
		mockFs({
			[filePath]: `Text\n${stringToCheck}\nSome other line`,
			[emptyFilePath]: '',
		});
	});

	afterEach(() => {});

	after(() => {
		mockFs.restore();
	});

	it('should return true if the string exists in the file', async () => {
		const result = await checkStringInFile.check(stringToCheck, filePath);
		expect(result).to.be.true;
	});

	it('should return false if the string does not exist in the file', async () => {
		const result = await checkStringInFile.check('wrongStringToCheck', filePath);
		expect(result).to.be.false;
	});

	it('should return false if the file is empty', async () => {
		const result = await checkStringInFile.check(stringToCheck, emptyFilePath);
		expect(result).to.be.false;
	});
});

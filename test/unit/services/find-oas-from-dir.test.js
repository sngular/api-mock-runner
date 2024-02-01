import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { fileContentIterator } from '../../helpers/file-content-iterator.js';
import { globalMocksFactory } from '../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

class Logger {
	static warn = sandbox.stub();
}
const mocks = {
	'../helpers/logger.js': { Logger },
};
const globalMocks = globalMocksFactory(sandbox);
const { fs, readline, path } = globalMocks;
const fileToTest = '../../../src/services/find-oas-from-dir.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { getFirstLine, isOas, findOasFromDir, findOasFromDirRecursive } = await esmock(
	absolutePath,
	absolutePath,
	mocks,
	globalMocks
);

describe('unit: find-oas-from-dir', () => {
	afterEach(() => {
		sandbox.reset();
	});

	describe('getFirstLine', () => {
		const firstLine = 'This is the first line';
		const filePath = 'path/to/file.txt';
		const emptyFilePath = 'path/to/empty-file.txt';

		it('should return the first line of the file', async () => {
			readline.createInterface.returns(fileContentIterator(firstLine));
			const result = await getFirstLine(filePath);
			expect(result).to.equal(firstLine);
			expect(fs.createReadStream).to.have.been.calledOnceWithExactly(filePath);
			expect(readline.createInterface).to.have.been.calledOnce;
		});

		it('should return undefined if the file is empty', async () => {
			readline.createInterface.returns(fileContentIterator());
			const result = await getFirstLine(emptyFilePath);
			expect(result).to.be.undefined;
			expect(fs.createReadStream).to.have.been.calledOnceWithExactly(emptyFilePath);
			expect(readline.createInterface).to.have.been.calledOnce;
		});
	});

	describe('isOas', () => {
		const filePath = 'path/to/file.yaml';

		it('should return true if the first line starts with "openapi"', async () => {
			readline.createInterface.returns(fileContentIterator('openapi 3.0.0'));
			const result = await isOas(filePath);
			expect(result).to.be.true;
		});

		it('should return false if the first line does not start with "openapi"', async () => {
			readline.createInterface.returns(fileContentIterator('swagger: "2.0"'));
			const result = await isOas(filePath);
			expect(result).to.be.false;
		});

		it('should return false if the first line is empty', async () => {
			readline.createInterface.returns(fileContentIterator(''));
			const result = await isOas(filePath);
			expect(result).to.be.false;
		});
	});

	describe('findOasFromDir', () => {
		it('should return empty array if no dir', async () => {
			fs.existsSync.returns(false);
			const result = await findOasFromDir('foo');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should return an array of oas files', async () => {
			fs.existsSync.returns(true);
			fs.readdirSync.returns(['foo.yaml', 'bar.yaml']);
			readline.createInterface
				.onCall(0)
				.returns(fileContentIterator('openapi 3.0.0'))
				.onCall(1)
				.returns(fileContentIterator('openapi 3.0.0'));
			const result = await findOasFromDir('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(2);
		});

		it('should return an empty array if no oas files', async () => {
			fs.existsSync.returns(true);
			fs.readdirSync.returns(['foo.yaml', 'bar.yaml']);
			readline.createInterface
				.onCall(0)
				.returns(fileContentIterator('swagger: "2.0"'))
				.onCall(1)
				.returns(fileContentIterator('swagger: "2.0"'));
			const result = await findOasFromDir('path/to/dir');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should return only yaml files', async () => {
			fs.existsSync.returns(true);
			fs.readdirSync.returns(['foo.txt', 'bar.yaml']);
			readline.createInterface.onCall(0).returns(fileContentIterator('openapi 3.0.0'));
			const result = await findOasFromDir('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(1);
		});
	});

	describe('findOasFromDirRecursive', () => {
		it('should return empty array if no dir', async () => {
			fs.existsSync.returns(false);
			const result = await findOasFromDirRecursive('foo');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should search on subdirectories', async () => {
			fs.existsSync.returns(true);
			fs.readdirSync.onCall(0).returns(['subdir']);
			fs.readdirSync.onCall(1).returns(['foo.yaml', 'bar.yaml']);
			fs.lstatSync.onCall(0).returns({ isDirectory: () => true });
			fs.lstatSync.onCall(1).returns({ isDirectory: () => false });
			fs.lstatSync.onCall(2).returns({ isDirectory: () => false });
			readline.createInterface
				.onCall(0)
				.returns(fileContentIterator('openapi 3.0.0'))
				.onCall(1)
				.returns(fileContentIterator('openapi 3.0.0'));
			const result = await findOasFromDirRecursive('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(2);
		});

		it('should return only oas files', async () => {
			fs.existsSync.returns(true);
			fs.readdirSync.onCall(0).returns(['subdir']);
			fs.readdirSync.onCall(1).returns(['foo.yaml', 'bar.yaml']);
			fs.lstatSync.onCall(0).returns({ isDirectory: () => true });
			fs.lstatSync.onCall(1).returns({ isDirectory: () => false });
			fs.lstatSync.onCall(2).returns({ isDirectory: () => false });
			readline.createInterface
				.onCall(0)
				.returns(fileContentIterator('openapi 3.0.0'))
				.onCall(1)
				.returns(fileContentIterator('swagger: "2.0"'));
			const result = await findOasFromDirRecursive('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(1);
		});

		it('should return only yaml files', async () => {
			fs.existsSync.returns(true);
			fs.readdirSync.onCall(0).returns(['subdir']);
			fs.readdirSync.onCall(1).returns(['foo.txt', 'bar.yaml']);
			fs.lstatSync.onCall(0).returns({ isDirectory: () => true });
			fs.lstatSync.onCall(1).returns({ isDirectory: () => false });
			fs.lstatSync.onCall(2).returns({ isDirectory: () => false });
			readline.createInterface.onCall(0).returns(fileContentIterator('openapi 3.0.0'));
			const result = await findOasFromDirRecursive('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(1);
		});

		it('should skip files starting with dot', async () => {
			fs.existsSync.returns(true);
			fs.readdirSync.returns(['.hidden.yaml', 'valid.yaml']);
			fs.lstatSync.returns({ isDirectory: () => false });
			readline.createInterface.onCall(0).returns(fileContentIterator('openapi 3.0.0'));
			path.join.returns('path/to/valid.yaml');
			const result = await findOasFromDirRecursive('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(1);
			expect(result[0]).to.deep.equal({
				fileName: 'valid.yaml',
				path: 'path/to/dir',
				filePath: 'path/to/valid.yaml',
			});
		});
	});
});

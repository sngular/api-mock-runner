import { expect } from 'chai';
import mockFs from 'mock-fs';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { stub, spy, restore } from 'sinon';

import { oas } from '../../../src/services/find-oas-from-dir.js';

describe('unit: find-oas-from-dir', () => {
	describe('findOasFromDir', () => {
		let existsSyncStub;
		let readdirSyncStub;
		let isOasStub;
		let joinStub;
		beforeEach(() => {
			existsSyncStub = stub(fs, 'existsSync');
			readdirSyncStub = stub(fs, 'readdirSync');
			isOasStub = stub(oas, 'isOas');
			joinStub = stub(path, 'join');
		});

		afterEach(() => {
			restore();
		});

		it('should return empty array if no dir', async () => {
			const logStub = stub(console, 'log');
			logStub.returns();
			existsSyncStub.returns(false);
			const result = await oas.findOasFromDir('foo');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should return an array of oas files', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.returns(['foo.yaml', 'bar.yaml']);
			isOasStub.returns(true);
			joinStub.returns('foo/bar.yaml');
			const result = await oas.findOasFromDir('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(2);
		});
		it('should return an empty array if no oas files', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.returns(['foo.yaml', 'bar.yaml']);
			isOasStub.returns(false);
			joinStub.returns('foo/bar.yaml');
			const result = await oas.findOasFromDir('path/to/dir');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should return only yaml files', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.returns(['foo.txt', 'bar.yaml']);
			isOasStub.returns(true);
			joinStub.returns('foo/bar.yaml');
			const result = await oas.findOasFromDir('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(1);
		});
	});

	describe('findOasFromDirRecursive', () => {
		let existsSyncStub;
		let readdirSyncStub;
		let isOasStub;
		let joinStub;
		let lstatSyncStub;
		beforeEach(() => {
			existsSyncStub = stub(fs, 'existsSync');
			readdirSyncStub = stub(fs, 'readdirSync');
			isOasStub = stub(oas, 'isOas');
			joinStub = stub(path, 'join');
			lstatSyncStub = stub(fs, 'lstatSync');
		});

		afterEach(() => {
			restore();
		});

		it('should return empty array if no dir', async () => {
			const logStub = stub(console, 'log');
			logStub.returns();
			existsSyncStub.returns(false);
			const result = await oas.findOasFromDirRecursive('foo');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should search on subdirectories', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.onCall(0).returns(['subdir']);
			readdirSyncStub.onCall(1).returns(['foo.yaml', 'bar.yaml']);
			lstatSyncStub.onCall(0).returns({ isDirectory: () => true });
			lstatSyncStub.onCall(1).returns({ isDirectory: () => false });
			lstatSyncStub.onCall(2).returns({ isDirectory: () => false });
			isOasStub.returns(true);
			joinStub.returns('foo/bar.yaml');
			const result = await oas.findOasFromDirRecursive('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(2);
		});

		it('should return only oas files', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.onCall(0).returns(['subdir']);
			readdirSyncStub.onCall(1).returns(['foo.yaml', 'bar.yaml']);
			lstatSyncStub.onCall(0).returns({ isDirectory: () => true });
			lstatSyncStub.onCall(1).returns({ isDirectory: () => false });
			lstatSyncStub.onCall(2).returns({ isDirectory: () => false });
			isOasStub.onCall(0).returns(true);
			isOasStub.onCall(1).returns(false);
			joinStub.returns('foo/bar.yaml');
			const result = await oas.findOasFromDirRecursive('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(1);
		});

		it('should return only yaml files', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.onCall(0).returns(['subdir']);
			readdirSyncStub.onCall(1).returns(['foo.txt', 'bar.yaml']);
			lstatSyncStub.onCall(0).returns({ isDirectory: () => true });
			lstatSyncStub.onCall(1).returns({ isDirectory: () => false });
			lstatSyncStub.onCall(2).returns({ isDirectory: () => false });
			isOasStub.returns(true);
			joinStub.returns('foo/bar.yaml');
			const result = await oas.findOasFromDirRecursive('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(1);
		});

		it('should skip files starting with dot', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.returns(['.hidden.yaml', 'valid.yaml']);
			lstatSyncStub.returns({ isDirectory: () => false });
			isOasStub.returns(true);
			joinStub.returns('path/to/valid.yaml');
			const result = await oas.findOasFromDirRecursive('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(1);
			expect(result[0]).to.deep.equal({
				fileName: 'valid.yaml',
				path: 'path/to/dir',
				filePath: 'path/to/valid.yaml',
			});
		});
	});

	describe('isOas', () => {
		let getFirstLineStub;
		const filePath = 'path/to/file.yaml';

		beforeEach(() => {
			getFirstLineStub = stub(oas, 'getFirstLine');
		});

		afterEach(() => {
			restore();
		});

		it('should return true if the first line starts with "openapi"', async () => {
			getFirstLineStub.resolves('openapi 3.0.0');
			const result = await oas.isOas(filePath);
			expect(result).to.be.true;
		});

		it('should return false if the first line does not start with "openapi"', async () => {
			getFirstLineStub.resolves('swagger: "2.0"');
			const result = await oas.isOas(filePath);
			expect(result).to.be.false;
		});

		it('should return false if the first line is empty', async () => {
			getFirstLineStub.resolves('');
			const result = await oas.isOas(filePath);
			expect(result).to.be.false;
		});
	});

	describe('getFirstLine', () => {
		const firstLine = 'This is the first line';
		const filePath = 'path/to/file.txt';
		const emptyFilePath = 'path/to/empty-file.txt';
		let createInterfaceStub;
		let createReadStreamStub;
		before(() => {
			mockFs({
				[filePath]: `${firstLine}\nSome other line`,
				[emptyFilePath]: '',
			});
			createInterfaceStub = spy(readline, 'createInterface');
			createReadStreamStub = spy(fs, 'createReadStream');
		});
		after(() => {
			mockFs.restore();
			createInterfaceStub.restore();
			createReadStreamStub.restore();
		});

		afterEach(() => {
			createReadStreamStub.resetHistory();
			createInterfaceStub.resetHistory();
		});

		it('should return the first line of the file', async () => {
			const result = await oas.getFirstLine(filePath);
			expect(result).to.equal(firstLine);
			expect(createReadStreamStub).to.have.been.calledOnceWithExactly(filePath);
			expect(createInterfaceStub).to.have.been.calledOnce;
		});

		it('should return undefined if the file is empty', async () => {
			const result = await oas.getFirstLine(emptyFilePath);
			expect(result).to.be.undefined;
			expect(createReadStreamStub).to.have.been.calledOnceWithExactly(emptyFilePath);
			expect(createInterfaceStub).to.have.been.calledOnce;
		});
	});
});

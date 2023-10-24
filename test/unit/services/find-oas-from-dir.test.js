import path from 'node:path';
import fs from 'node:fs';
import { stub, restore } from 'sinon';
import { findOasFromDir, findOasFromDirRecursive, oasUtils } from '../../../src/services/find-oas-from-dir.js';
import { expect } from 'chai';

describe('unit:find-oas-from-dir', () => {
	describe('findOasFromDir', () => {
		let existsSyncStub;
		let readdirSyncStub;
		let isOasStub;
		let joinStub;
		beforeEach(() => {
			existsSyncStub = stub(fs, 'existsSync');
			readdirSyncStub = stub(fs, 'readdirSync');
			isOasStub = stub(oasUtils, 'isOas');
			joinStub = stub(path, 'join');
		});

		afterEach(() => {
			restore();
		});

		it('should return empty array if no dir', async () => {
			const logStub = stub(console, 'log');
			logStub.returns();
			existsSyncStub.returns(false);
			const result = await findOasFromDir('foo');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should return an array of oas files', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.returns(['foo.yaml', 'bar.yaml']);
			isOasStub.returns(true);
			joinStub.returns('foo/bar.yaml');
			const result = await findOasFromDir('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(2);
		});
		it('should return an empty array if no oas files', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.returns(['foo.yaml', 'bar.yaml']);
			isOasStub.returns(false);
			joinStub.returns('foo/bar.yaml');
			const result = await findOasFromDir('path/to/dir');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should return only yaml files', async () => {
			existsSyncStub.returns(true);
			readdirSyncStub.returns(['foo.txt', 'bar.yaml']);
			isOasStub.returns(true);
			joinStub.returns('foo/bar.yaml');
			const result = await findOasFromDir('path/to/dir');
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
			isOasStub = stub(oasUtils, 'isOas');
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
			const result = await findOasFromDirRecursive('foo');
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
			const result = await findOasFromDirRecursive('path/to/dir');
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
			const result = await findOasFromDirRecursive('path/to/dir');
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
			const result = await findOasFromDirRecursive('path/to/dir');
			expect(result).to.be.an('array').that.has.lengthOf(1);
		});
	});
});

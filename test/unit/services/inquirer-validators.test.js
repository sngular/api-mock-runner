import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { validationErrorMessages } from '../../../src/helpers/messages.js';
import { globalMocksFactory } from '../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

const mocks = {};
const globalMocks = globalMocksFactory(sandbox);
const { fs } = globalMocks;
const fileToTest = '../../../src/services/inquirer-validators.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { originValidator, portValidator } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

describe('unit: inquirer-validators', () => {
	describe('originValidator', () => {
		const validRemoteHttpsOrigin = 'https://github.com/user/repo.git';
		const validRemoteGitOrigin = 'git@github.com:user/repo.git';
		const validLocalPath = '/path/to/local';

		afterEach(() => {
			sandbox.reset();
		});

		it('should return true if the value is a valid local path', () => {
			fs.existsSync.withArgs(validLocalPath).returns(true);
			expect(originValidator(validLocalPath)).to.be.true;
		});

		it('should return true if the value is a valid remote origin with https', () => {
			expect(originValidator(validRemoteHttpsOrigin)).to.be.true;
		});

		it('should return true if the value is a valid remote origin with git@', () => {
			expect(originValidator(validRemoteGitOrigin)).to.be.true;
		});

		it('should return an error message if the value is not a valid local path nor remote origin', () => {
			expect(originValidator('invalid-value')).to.equal(validationErrorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with a starting space', () => {
			expect(originValidator(` ${validRemoteGitOrigin}`)).to.equal(validationErrorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with a starting tab', () => {
			expect(originValidator(`\t${validRemoteGitOrigin}`)).to.equal(validationErrorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with a starting newline character', () => {
			expect(originValidator(`\n${validRemoteGitOrigin}`)).to.equal(validationErrorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with an ending space', () => {
			expect(originValidator(`${validRemoteGitOrigin} `)).to.equal(validationErrorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with an ending tab', () => {
			expect(originValidator(`${validRemoteGitOrigin}\t`)).to.equal(validationErrorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with an ending newline character', () => {
			expect(originValidator(`${validRemoteGitOrigin}\n`)).to.equal(validationErrorMessages.origin.INVALID);
		});
	});

	describe('portValidator', () => {
		const selectedSchemas = [
			{ path: 'irrelevant', port: 5000 },
			{ path: 'irrelevant', port: 5001 },
		];

		it('should return true if the value is an integer between 0 and 65535 and not already selected', () => {
			expect(portValidator('0', selectedSchemas)).to.be.true;
			expect(portValidator('65535', selectedSchemas)).to.be.true;
			expect(portValidator('5002', selectedSchemas)).to.be.true;
		});

		it('should return an error message if the value is not an integer', () => {
			expect(portValidator('not an integer', selectedSchemas)).to.equal(validationErrorMessages.port.INVALID);
			expect(portValidator('3.14', selectedSchemas)).to.equal(validationErrorMessages.port.INVALID);
		});

		it('should return an error message if the value is less than 0', () => {
			expect(portValidator('-1', selectedSchemas)).to.equal(validationErrorMessages.port.INVALID);
			expect(portValidator('-100', selectedSchemas)).to.equal(validationErrorMessages.port.INVALID);
		});

		it('should return an error message if the value is greater than 65535', () => {
			expect(portValidator('65536', selectedSchemas)).to.equal(validationErrorMessages.port.INVALID);
			expect(portValidator('100000', selectedSchemas)).to.equal(validationErrorMessages.port.INVALID);
		});

		it('should return an error message if the value is already selected', () => {
			expect(portValidator('5000', selectedSchemas)).to.equal(validationErrorMessages.port.IN_USE);
		});
	});
});

import { expect, use } from 'chai';
import fs from 'fs';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

import { errorMessages, originValidator, portValidator } from '../../../src/services/inquirer-validators.js';

use(sinonChai);

describe('unit: inquirer-validators', () => {
	describe('originValidator', () => {
		const validRemoteHttpsOrigin = 'https://github.com/user/repo.git';
		const validRemoteGitOrigin = 'git@github.com:user/repo.git';
		const validLocalPath = '/path/to/local';

		it('should return true if the value is a valid local path', () => {
			let existsSyncStub = stub(fs, 'existsSync');
			existsSyncStub.withArgs(validLocalPath).returns(true);
			expect(originValidator(validLocalPath)).to.be.true;
			existsSyncStub.restore();
		});

		it('should return true if the value is a valid remote origin with https', () => {
			expect(originValidator(validRemoteHttpsOrigin)).to.be.true;
		});

		it('should return true if the value is a valid remote origin with git@', () => {
			expect(originValidator(validRemoteGitOrigin)).to.be.true;
		});

		it('should return an error message if the value is not a valid local path nor remote origin', () => {
			expect(originValidator('invalid-value')).to.equal(errorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with a starting space', () => {
			expect(originValidator(` ${validRemoteGitOrigin}`)).to.equal(errorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with a starting tab', () => {
			expect(originValidator(`\t${validRemoteGitOrigin}`)).to.equal(errorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with a starting newline character', () => {
			expect(originValidator(`\n${validRemoteGitOrigin}`)).to.equal(errorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with an ending space', () => {
			expect(originValidator(`${validRemoteGitOrigin} `)).to.equal(errorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with an ending tab', () => {
			expect(originValidator(`${validRemoteGitOrigin}\t`)).to.equal(errorMessages.origin.INVALID);
		});

		it('should return an error message if the value is a valid remote origin with an ending newline character', () => {
			expect(originValidator(`${validRemoteGitOrigin}\n`)).to.equal(errorMessages.origin.INVALID);
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
			expect(portValidator('not an integer', selectedSchemas)).to.equal(errorMessages.port.INVALID);
			expect(portValidator('3.14', selectedSchemas)).to.equal(errorMessages.port.INVALID);
		});

		it('should return an error message if the value is less than 0', () => {
			expect(portValidator('-1', selectedSchemas)).to.equal(errorMessages.port.INVALID);
			expect(portValidator('-100', selectedSchemas)).to.equal(errorMessages.port.INVALID);
		});

		it('should return an error message if the value is greater than 65535', () => {
			expect(portValidator('65536', selectedSchemas)).to.equal(errorMessages.port.INVALID);
			expect(portValidator('100000', selectedSchemas)).to.equal(errorMessages.port.INVALID);
		});

		it('should return an error message if the value is already selected', () => {
			expect(portValidator('5000', selectedSchemas)).to.equal(errorMessages.port.IN_USE);
		});
	});
});

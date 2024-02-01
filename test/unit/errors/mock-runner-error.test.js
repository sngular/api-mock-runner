import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox, match } from 'sinon';
import sinonChai from 'sinon-chai';

import { colourCodes } from '../../../src/helpers/colours.js';
import { globalMocksFactory } from '../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();
class Logger {
	static error = sandbox.stub();
	static info = sandbox.stub();
}

const mocks = {
	'../helpers/logger.js': { Logger },
};
const globalMocks = globalMocksFactory(sandbox);
const fileToTest = '../../../src/errors/mock-runner-error.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { MockRunnerError } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

// Use Sinon-Chai assertions
use(sinonChai);

describe('unit: MockRunnerError', () => {
	afterEach(() => {
		sandbox.reset();
	});

	it('should have the correct properties', () => {
		const error = new MockRunnerError('Test error', 500, 2, 'testEmitter');
		expect(error).to.be.an.instanceOf(Error);
		expect(error).to.have.property('name', 'MockRunnerError');
		expect(error).to.have.property('message', 'Test error');
		expect(error).to.have.property('code', 500);
		expect(error).to.have.property('level', 2);
		expect(error).to.have.property('emitter', 'testEmitter');
		expect(error).to.have.property('opt').that.deep.equals({});
	});

	it('should capture stack trace', () => {
		const error = new MockRunnerError('Test error', 500, 2, 'testEmitter');
		expect(error.stack).to.be.a('string');
	});

	describe('showError', () => {
		it('should log the error information and use red color with a type 2', () => {
			const error = new MockRunnerError('Test error', 500, 2, 'testEmitter');
			error.showError();

			expect(Logger.error).to.have.been.calledWith(match((value) => value.includes(colourCodes.fg.red)));
			expect(Logger.info).to.have.been.calledOnceWithExactly(error.stack);
		});

		it('should log the error information and use crimson color with a type 2', () => {
			const error = new MockRunnerError('Test error', 500, 1, 'testEmitter');
			error.showError();

			expect(Logger.error).to.have.been.calledWith(match((value) => value.includes(colourCodes.fg.crimson)));
			expect(Logger.info).to.have.been.calledOnceWithExactly(error.stack);
		});

		it('should log the error information and use cyan color with a type undefined', () => {
			const error = new MockRunnerError('Test error', 500, undefined, 'testEmitter');
			error.showError();

			expect(Logger.error).to.have.been.calledWith(match((value) => value.includes(colourCodes.fg.cyan)));
			expect(Logger.info).to.have.been.calledOnceWithExactly(error.stack);
		});
	});
});

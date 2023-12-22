import { expect, use } from 'chai';
import { stub, match } from 'sinon';
import sinonChai from 'sinon-chai';

import { MockRunnerError } from '../../../src/errors/mock-runner-error.js';
import { colourCodes } from '../../../src/helpers/colours.js';
import { Logger } from '../../../src/helpers/logger.js';

// Use Sinon-Chai assertions
use(sinonChai);

describe('unit: MockRunnerError', () => {
	let error;

	beforeEach(() => {});

	afterEach(() => {});

	it('should have the correct properties', () => {
		error = new MockRunnerError('Test error', 500, 2, 'testEmitter');
		expect(error).to.be.an.instanceOf(Error);
		expect(error).to.have.property('name', 'MockRunnerError');
		expect(error).to.have.property('message', 'Test error');
		expect(error).to.have.property('code', 500);
		expect(error).to.have.property('level', 2);
		expect(error).to.have.property('emitter', 'testEmitter');
		expect(error).to.have.property('opt').that.deep.equals({});
	});

	it('should capture stack trace', () => {
		error = new MockRunnerError('Test error', 500, 2, 'testEmitter');
		expect(error.stack).to.be.a('string');
	});

	describe('showError', () => {
		let loggerErrorStub, loggerInfoStub;

		beforeEach(() => {
			loggerErrorStub = stub(Logger, 'error');
			loggerInfoStub = stub(Logger, 'info');
		});

		afterEach(() => {
			loggerErrorStub.restore();
			loggerInfoStub.restore();
		});

		it('should log the error information and use red color with a type 2', () => {
			error = new MockRunnerError('Test error', 500, 2, 'testEmitter');
			error.showError();

			expect(loggerErrorStub).to.have.been.calledWith(match((value) => value.includes(colourCodes.fg.red)));
			expect(loggerInfoStub).to.have.been.calledOnceWithExactly(error.stack);
		});

		it('should log the error information and use crimson color with a type 2', () => {
			error = new MockRunnerError('Test error', 500, 1, 'testEmitter');
			error.showError();

			expect(loggerErrorStub).to.have.been.calledWith(match((value) => value.includes(colourCodes.fg.crimson)));
			expect(loggerInfoStub).to.have.been.calledOnceWithExactly(error.stack);
		});

		it('should log the error information and use cyan color with a type undefined', () => {
			error = new MockRunnerError('Test error', 500, undefined, 'testEmitter');
			error.showError();

			expect(loggerErrorStub).to.have.been.calledWith(match((value) => value.includes(colourCodes.fg.cyan)));
			expect(loggerInfoStub).to.have.been.calledOnceWithExactly(error.stack);
		});
	});
});

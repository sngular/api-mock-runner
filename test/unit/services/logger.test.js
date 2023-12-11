import { expect, use } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
import Logger from '../../../src/utils/logger.js';

use(sinonChai);

describe('unit: logger', () => {
	let consoleSpy;

	beforeEach(() => {
		consoleSpy = stub(console, 'log');
	});

	afterEach(() => {
		consoleSpy.restore();
	});

	it('should log an informational message to the console with no extra', () => {
		const message = 'test message';
		Logger.info(message);
		expect(consoleSpy).to.have.been.calledOnce;
	});

	it('should log an informational message to the console with string text as extra', () => {
		const message = 'test message';
		const extra = 'extra text';
		Logger.info(message, extra);
		expect(consoleSpy).to.have.been.calledOnce;
	});

	it('should log an informational message to the console with an object as extra', () => {
		const message = 'test message';
		const extra = { test: 'extra object' };
		Logger.info(message, extra);
		expect(consoleSpy).to.have.been.calledTwice;
	});

	it('should log a warning message to the console with no extra', () => {
		const message = 'test message';
		Logger.warn(message);
		expect(consoleSpy).to.have.been.calledOnce;
	});

	it('should log an error message to the console with no extra', () => {
		const message = 'test message';
		Logger.error(message);
		expect(consoleSpy).to.have.been.calledOnce;
	});

	it('should log an empty line to the console', () => {
		Logger.emptyLine();
		expect(consoleSpy).to.have.been.calledOnce;
	});
});

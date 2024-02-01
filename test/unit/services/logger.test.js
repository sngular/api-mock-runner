import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { globalMocksFactory } from '../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

const mocks = {};
const globalMocks = globalMocksFactory(sandbox);
const fileToTest = '../../../src/helpers/logger.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { Logger } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

describe('unit: logger', () => {
	let consoleSpy;

	beforeEach(() => {
		consoleSpy = sandbox.stub(console, 'log');
	});

	afterEach(() => {
		sandbox.restore();
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

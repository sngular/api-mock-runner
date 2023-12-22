#!/usr/bin/env node
import { MockRunnerError } from './errors/mock-runner-error.js';
import { main } from './main.js';

try {
	await main.run();
} catch (e) {
	if (e instanceof Error) {
		const err = new MockRunnerError(e.message, 500, 1, 'Entry point');
		err.showError();
	}
}

#!/usr/bin/env node
import { main } from './main.js';
import { MockRunnerError } from './services/utils.js';

try {
	await main();
} catch (e) {
	if (e instanceof Error) {
		const err = new MockRunnerError(e.message, 500, 1, 'Entry point');
		err.showError();
	}
}

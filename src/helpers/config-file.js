import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { RC_FILE_NAME } from './constants.js';
import { Logger } from './logger.js';
import { messages } from './messages.js';

/**
 * @typedef {import('../types/types.d.js').Config} Config
 */

/**
 * Get the config from the config file.
 * @returns {Config | null} The config object.
 */
export function getConfigFromFile() {
	const filePath = join(cwd(), RC_FILE_NAME);
	if (!existsSync(filePath)) {
		Logger.warn(messages.CONFIG_FILE_NOT_FOUND, RC_FILE_NAME);
		return null;
	}
	const fileContent = readFileSync(filePath, 'utf-8');
	try {
		return /** @type {Config} */ (JSON.parse(fileContent)) || null;
	} catch (error) {
		Logger.error(messages.CONFIG_FILE_INVALID(RC_FILE_NAME));
		return null;
	}
}

/**
 * Save runtime config into rc file.
 * @param {Config} config Config object to write.
 */
export function saveConfigToFile(config) {
	const filePath = join(cwd(), RC_FILE_NAME);
	const fileContent = JSON.stringify(config, null, '\t');
	writeFileSync(filePath, fileContent);
	Logger.info(messages.SAVED_CONFIG(RC_FILE_NAME), config);
}

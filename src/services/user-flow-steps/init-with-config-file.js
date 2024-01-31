import confirm from '@inquirer/confirm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { init } from './init.js';
import { RC_FILE_NAME } from '../../helpers/constants.js';
import { Logger } from '../../helpers/logger.js';
import { messages } from '../../helpers/messages.js';

/**
 * @typedef {import('../../types/types.d.js').Config} Config
 */

/**
 * User flow when the config file already exists.
 * @async
 * @function initWithConfigFile
 * @returns {Promise<Config>} An object with the initial values from the user.
 */
export async function initWithConfigFile() {
	const configFilePath = join(cwd(), RC_FILE_NAME);
	const fileContent = readFileSync(configFilePath, 'utf-8');
	const existingConfig = /** @type {Config} */ (JSON.parse(fileContent)) || {};
	Logger.info(messages.CURRENT_CONFIG, existingConfig);
	const useExistingConfig = await confirm({
		message: messages.CONFIRM_EXISTING_CONFIG,
	});
	return useExistingConfig ? existingConfig : init();
}

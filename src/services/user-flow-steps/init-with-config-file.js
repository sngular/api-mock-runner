import confirm from '@inquirer/confirm';

import { init } from './init.js';
import { getConfigFromFile } from '../../helpers/config-file.js';
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
	const existingConfig = getConfigFromFile();
	if (existingConfig) {
		Logger.info(messages.CURRENT_CONFIG, existingConfig);
		const useExistingConfig = await confirm({
			message: messages.CONFIRM_EXISTING_CONFIG,
		});
		return useExistingConfig ? existingConfig : init();
	} else {
		return init();
	}
}

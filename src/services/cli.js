import * as inquirer from '@inquirer/prompts';

/**
 * Confirm through CLI adding a file to .gitignore
 * @async
 * @function confirmAddToGitignore
 * @param {string} fileName - The file name to add to .gitignore
 * @returns {Promise<boolean>} True if the user confirms, false otherwise
 */
async function confirmAddToGitignore(fileName) {
	return await inquirer.confirm({
		message: `Add ${fileName} to .gitignore?`,
	});
}

export const cli = { confirmAddToGitignore };

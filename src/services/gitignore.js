import confirm from '@inquirer/confirm';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { check } from './check-string-in-file.js';
import { messages } from '../helpers/messages.js';

export const GITIGNORE_PATH = join(cwd(), '.gitignore');

/**
 * Append a newline with file or folder name to .gitignore.
 * If .gitignore does not exist, it will be created.
 * If the file or folder name is already in .gitignore, it will not be added again.
 * Any action is confirmed through the CLI by the user.
 * @async
 * @function addToGitignore
 * @param {string} fileName - The file or folder name to append to .gitignore.
 * @returns {Promise<void>}
 */
export async function addToGitignore(fileName) {
	const existsGitignoreFile = existsSync(GITIGNORE_PATH);
	const isInGitignoreFile = existsGitignoreFile && (await isInGitignore(fileName));
	const shouldAddToGitignore = !existsGitignoreFile || !isInGitignoreFile;

	if (shouldAddToGitignore && (await confirm({ message: messages.CONFIRM_ADD_TO_GITIGNORE(fileName) }))) {
		const leadingCharacter = existsGitignoreFile ? getLeadingCharacter() : '';
		appendFileSync(GITIGNORE_PATH, `${leadingCharacter}${fileName}\n`);
	}
}

/**
 * Check if a string is in .gitignore.
 * @async
 * @function isInGitignore
 * @param {string} textToCheck - The text to check.
 * @returns {Promise<boolean>} True if the text is in .gitignore, false otherwise.
 */
async function isInGitignore(textToCheck) {
	const result = await check(textToCheck, GITIGNORE_PATH);
	return result;
}

/**
 * Get the leading character for .gitignore.
 * @function getLeadingCharacter
 * @returns {string} The leading character for .gitignore.
 */
function getLeadingCharacter() {
	const lastFileCharacter = readFileSync(GITIGNORE_PATH, 'utf8').slice(-1);
	return lastFileCharacter === '\n' ? '' : '\n';
}

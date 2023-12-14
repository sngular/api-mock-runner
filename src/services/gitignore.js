import { confirm } from '@inquirer/prompts';
import fs from 'node:fs';
import path from 'node:path';

import { checkStringInFile } from './check-string-in-file.js';

export const GITIGNORE_PATH = path.join(process.cwd(), '.gitignore');

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
export default async function addToGitignore(fileName) {
	const existsGitignoreFile = fs.existsSync(GITIGNORE_PATH);
	if (
		(!existsGitignoreFile || !(await isInGitignore(fileName))) &&
		(await confirm({ message: `Add ${fileName} to .gitignore?` }))
	) {
		const leadingCharacter = existsGitignoreFile ? getLeadingCharacter() : '';
		fs.appendFileSync(GITIGNORE_PATH, `${leadingCharacter}${fileName}\n`);
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
	const result = await checkStringInFile.check(textToCheck, GITIGNORE_PATH);
	return result;
}

/**
 * Get the leading character for .gitignore.
 * @function getLeadingCharacter
 * @returns {string} The leading character for .gitignore.
 */
function getLeadingCharacter() {
	let leadingCharacter = '';
	const lastFileCharacter = fs.readFileSync(GITIGNORE_PATH, 'utf8').slice(-1);
	leadingCharacter = lastFileCharacter === '\n' ? '' : '\n';
	return leadingCharacter;
}

import * as fs from 'node:fs';
import checkStringInFile from './check-string-in-file.js';

/**
 * The name of the config file
 * @constant
 * @type {string}
 * @default
 */
export const RC_FILE_NAME = '.apimockrc';
/**
 * The name of the temporary folder
 * @constant
 * @type {string}
 * @default
 */
export const TEMP_FOLDER_NAME = '.api-mock-runner';
/**
 * Append text to .gitignore
 * @async
 * @function addToGitignore
 * @param {string} textToAppend - The text to append to .gitignore
 * @returns {Promise<boolean>}
 */
export async function addToGitignore(textToAppend) {
	if (!(await checkStringInFile(textToAppend, `${process.cwd()}/.gitignore`))) {
		fs.appendFileSync(`${process.cwd()}/.gitignore`, `\n${textToAppend}`);
		return true;
	}
	return false;
}
/**
 * Verify if the origin is remote
 * @function verifyRemoteOrigin
 * @param {string} origin - The origin to verify
 * @returns {boolean} True if the origin is remote, false otherwise
 */
export function verifyRemoteOrigin(origin) {
	/*
	 * NOTE: Regex explanation
	 * - /^(git@|https:\/\/)/: This part of the regex specifies that the string must start with either "git@" or "https://".
	 * - [^\s]+: This part ensures that there is at least one or more characters after "git@" or "https://". It matches any character except whitespace.
	 * - (\.git)$: The regex ends with "\.git", ensuring that the string must end with ".git".
	 */
	const isOriginRemoteRegex = /^(git@|https:\/\/)[^\s]+(\.git)$/;

	const isOriginRemote = isOriginRemoteRegex.test(origin);
	return isOriginRemote;
}

export default {
	RC_FILE_NAME,
	TEMP_FOLDER_NAME,
	addToGitignore,
	verifyRemoteOrigin,
};

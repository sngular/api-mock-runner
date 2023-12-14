import fs from 'node:fs';
import readline from 'node:readline';

/**
 * Check if a string is in a file.
 * @async
 * @function check
 * @param {string} stringToCheck - The string to check.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<boolean>} True if the string is in the file, false otherwise.
 */
async function check(stringToCheck, filePath) {
	const reader = readline.createInterface({ input: fs.createReadStream(filePath) });
	let exists = false;

	for await (const line of reader) {
		if (line === stringToCheck) {
			// REFACTOR: return true instead of setting a variable
			exists = line === stringToCheck;
			break;
		}
	}

	return exists;
}
export const checkStringInFile = { check };

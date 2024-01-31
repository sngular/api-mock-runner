import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

/**
 * Check if a string is in a file.
 * @async
 * @function check
 * @param {string} stringToCheck - The string to check.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<boolean>} True if the string is in the file, false otherwise.
 */
export async function check(stringToCheck, filePath) {
	const input = createReadStream(filePath);
	const reader = createInterface({ input });
	for await (const line of reader) {
		if (line === stringToCheck) {
			return true;
		}
	}
	return false;
}

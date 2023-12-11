import fs from 'node:fs';
import readline from 'node:readline';

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

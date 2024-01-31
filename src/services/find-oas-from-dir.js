import { createReadStream, existsSync, lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

import { Logger } from '../helpers/logger.js';
import { messages } from '../helpers/messages.js';

/**
 * @typedef {import('../types/types.d.js').OasFile} OasFile
 */

/**
 * Get the first line of a file.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<string>} The first line of the file.
 */
export async function getFirstLine(filePath) {
	const input = createReadStream(filePath);
	const reader = createInterface({ input });
	const iterator = reader[Symbol.asyncIterator]();
	/** @type {IteratorResult<string, string>} */
	const line = await iterator.next();
	return line.value;
}

/**
 * Check if a file is an OpenAPI specification.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<boolean>} True if the file is an OpenAPI specification, false otherwise.
 */
export async function isOas(filePath) {
	const firstLine = await getFirstLine(filePath);
	const oasRegEx = /^openapi/i;
	return oasRegEx.test(firstLine);
}

/**
 * Find OpenAPI specifications in a directory.
 * @async
 * @function findOasFromDir
 * @param {string} startPath - The path to the directory.
 * @returns {Promise<OasFile[]>} An array of OpenAPI specifications.
 */
export const findOasFromDir = async (startPath) => {
	if (!existsSync(startPath)) {
		Logger.warn(messages.DIRECTORY_NOT_FOUND, startPath);
		return [];
	}

	const files = readdirSync(startPath);
	/** @type {OasFile[]} */
	const oasFiles = [];

	for (const file of files) {
		const filePath = join(startPath, file);
		if ((file.endsWith('.yaml') || file.endsWith('.yml')) && (await isOas(filePath))) {
			oasFiles.push({
				fileName: file,
				path: startPath,
				filePath,
			});
		}
	}
	return oasFiles;
};

/**
 * Find OpenAPI specifications in a directory recursively.
 * @async
 * @function findOasFromDirRecursive
 * @param {string} startPath - The path to the directory.
 * @param {OasFile[]} [oasFiles] - An array of OpenAPI specifications.
 * @returns {Promise<OasFile[]>} An array of OpenAPI specifications.
 */
export const findOasFromDirRecursive = async (startPath, oasFiles = []) => {
	if (!existsSync(startPath)) {
		Logger.warn(messages.DIRECTORY_NOT_FOUND, startPath);
		return [];
	}

	const files = readdirSync(startPath);

	for (const file of files) {
		if (file.startsWith('.')) continue;
		const filePath = join(startPath, file);
		const stat = lstatSync(filePath);
		if (stat.isDirectory()) {
			await findOasFromDirRecursive(filePath, oasFiles);
		} else if ((file.endsWith('.yaml') || file.endsWith('.yml')) && (await isOas(filePath))) {
			oasFiles.push({
				fileName: file,
				path: startPath,
				filePath,
			});
		}
	}
	return oasFiles;
};

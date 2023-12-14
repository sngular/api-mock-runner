import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

import Logger from '../utils/logger.js';
import { messages } from '../utils/messages.js';

/**
 * @typedef {import('../types/types.d.js').OasFile} OasFile
 */

/**
 * Get the first line of a file.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<string>} The first line of the file.
 */
async function getFirstLine(filePath) {
	const reader = readline.createInterface({ input: fs.createReadStream(filePath) });
	const it = reader[Symbol.asyncIterator]();
	/** @type {IteratorResult<string, string>} */
	const line = await it.next();
	return line.value;
}

/**
 * Check if a file is an OpenAPI specification.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<boolean>} True if the file is an OpenAPI specification, false otherwise.
 */
async function isOas(filePath) {
	const firstLine = await oasUtils.getFirstLine(filePath);
	const oasRegEx = /^openapi/i;
	return oasRegEx.test(firstLine);
}

export const oasUtils = { isOas, getFirstLine };

/**
 * Find OpenAPI specifications in a directory.
 * @async
 * @function findOasFromDir
 * @param {string} startPath - The path to the directory.
 * @returns {Promise<OasFile[]>} An array of OpenAPI specifications.
 */
export const findOasFromDir = async (startPath) => {
	if (!fs.existsSync(startPath)) {
		Logger.warn(messages.DIRECTORY_NOT_FOUND, startPath);
		return [];
	}

	const files = fs.readdirSync(startPath);
	/** @type {OasFile[]} */
	const oasFiles = [];

	for (const file of files) {
		const filePath = path.join(startPath, file);
		if ((file.endsWith('.yaml') || file.endsWith('.yml')) && (await oasUtils.isOas(filePath))) {
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
	if (!fs.existsSync(startPath)) {
		Logger.warn(messages.DIRECTORY_NOT_FOUND, startPath);
		return [];
	}

	const files = fs.readdirSync(startPath);

	for (const file of files) {
		if (file.startsWith('.')) continue;
		const filePath = path.join(startPath, file);
		const stat = fs.lstatSync(filePath);
		if (stat.isDirectory()) {
			await findOasFromDirRecursive(filePath, oasFiles);
		} else if ((file.endsWith('.yaml') || file.endsWith('.yml')) && (await oasUtils.isOas(filePath))) {
			oasFiles.push({
				fileName: file,
				path: startPath,
				filePath,
			});
		}
	}
	return oasFiles;
};

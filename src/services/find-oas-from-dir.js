import path from 'node:path';
import fs from 'node:fs';
import * as readline from 'readline';
import Logger from '../utils/logger.js';
import { messages } from '../utils/messages.js';

async function getFirstLine(filePath) {
	const reader = readline.createInterface({ input: fs.createReadStream(filePath) });
	const it = reader[Symbol.asyncIterator]();
	const line = await it.next();
	return line.value;
}

async function isOas(filePath) {
	const firstLine = await getFirstLine(filePath);
	const oasRegEx = /^openapi/i;
	return oasRegEx.test(firstLine);
}
export const oasUtils = { isOas, getFirstLine };

export const findOasFromDir = async (startPath) => {
	if (!fs.existsSync(startPath)) {
		Logger.warn(messages.DIRECTORY_NOT_FOUND, startPath);
		return [];
	}

	const files = fs.readdirSync(startPath);
	const oasFiles = [];

	for (const file of files) {
		const filePath = path.join(startPath, file);
		if ((file.endsWith('.yaml') || file.endsWith('.yml')) && (await oasUtils.isOas(filePath))) {
			oasFiles.push({
				filename: file,
				path: startPath,
				filePath,
			});
		}
	}
	return oasFiles;
};

export const findOasFromDirRecursive = async (startPath, acc) => {
	if (!fs.existsSync(startPath)) {
		Logger.warn(messages.DIRECTORY_NOT_FOUND, startPath);
		return [];
	}

	const files = fs.readdirSync(startPath);
	const oasFiles = acc || [];

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

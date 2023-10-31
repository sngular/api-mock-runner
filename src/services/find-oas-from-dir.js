import path from 'path';
import * as fs from 'fs';
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

const findOasFromDir = async (startPath, acc) => {
	if (!fs.existsSync(startPath)) {
		Logger.warn(messages.DIRECTORY_NOT_FOUND, startPath);
		return [];
	}

	const files = fs.readdirSync(startPath);
	const oasFiles = acc || [];

	for (const file of files) {
		const filePath = path.join(startPath, file);
		const stat = fs.lstatSync(filePath);
		if (stat.isDirectory()) {
			await findOasFromDir(filePath, oasFiles);
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

export default findOasFromDir;

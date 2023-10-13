// TODO:
// - Refactor
// - console.logs
// - tests
// - doc

import { execSync } from 'child_process';
import * as fs from 'fs';
import path from 'path';
import process from 'process';
import { TEMP_FOLDER_NAME } from './utils.js';

/**
 * Clone a git repository into a temporary folder
 * @param {string} repositoryURL
 */
async function cloneSchemaRepo(repositoryURL) {
	resetTempDir();
	cloneRepository(repositoryURL);
	printDirectoryContent();
}

function resetTempDir() {
	removeTempDir();
	fs.mkdirSync(TEMP_FOLDER_NAME);
}

function removeTempDir() {
	if (fs.existsSync(TEMP_FOLDER_NAME)) {
		fs.rmSync(TEMP_FOLDER_NAME, { recursive: true });
	}
}

function cloneRepository(repositoryURL) {
	execSync(`git clone ${repositoryURL} .`, {
		cwd: path.resolve(process.cwd(), TEMP_FOLDER_NAME), // path to where you want to save the file
	});
}

function printDirectoryContent() {
	fs.readdirSync(TEMP_FOLDER_NAME).forEach((file) => {
		console.log(`  - ${file}`);
	});
}

export default cloneSchemaRepo;

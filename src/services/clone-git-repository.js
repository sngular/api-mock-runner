import child_process from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/**
 * Clone a git repository.
 * @function cloneRepository
 * @param {string} repositoryURL - The URL of the git repository.
 * @param {string} dirName - The name of the directory where the repository will be cloned.
 */
export function cloneRepository(repositoryURL, dirName) {
	resetDirectory(dirName);
	clone(repositoryURL, dirName);
}

/**
 * Reset a directory.
 * @function resetDirectory
 * @param {string} dirName - The name of the directory to reset.
 */
function resetDirectory(dirName) {
	removeDirectory(dirName);
	fs.mkdirSync(dirName);
}

/**
 * Remove a directory.
 * @function removeDirectory
 * @param {string} dirName - The name of the directory to remove.
 */
function removeDirectory(dirName) {
	if (fs.existsSync(dirName)) {
		fs.rmSync(dirName, { recursive: true });
	}
}

/**
 * Execute git clone command.
 * @function clone
 * @param {string} repositoryURL - The URL of the git repository.
 * @param {string} dirName - The name of the directory where the repository will be cloned.
 */
function clone(repositoryURL, dirName) {
	child_process.execSync(`git clone ${repositoryURL} .`, {
		cwd: path.resolve(process.cwd(), dirName), // path to where you want to save the file
	});
}

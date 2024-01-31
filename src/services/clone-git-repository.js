import { execSync } from 'node:child_process';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

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
	mkdirSync(dirName);
}

/**
 * Remove a directory.
 * @function removeDirectory
 * @param {string} dirName - The name of the directory to remove.
 */
function removeDirectory(dirName) {
	if (existsSync(dirName)) {
		rmSync(dirName, { recursive: true });
	}
}

/**
 * Execute git clone command.
 * @function clone
 * @param {string} repositoryURL - The URL of the git repository.
 * @param {string} dirName - The name of the directory where the repository will be cloned.
 */
function clone(repositoryURL, dirName) {
	execSync(`git clone ${repositoryURL} .`, {
		cwd: resolve(cwd(), dirName), // path to where you want to save the file
	});
}

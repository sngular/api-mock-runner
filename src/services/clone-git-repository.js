import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

/**
 * Clone a git repository.
 * @function cloneGitRepository
 * @param {string} repositoryURL - The URL of the git repository.
 * @param {string} dirName - The name of the directory where the repository will be cloned.
 */
function cloneGitRepository(repositoryURL, dirName) {
	resetDirectory(dirName);
	cloneRepository(repositoryURL, dirName);
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
 * Clone a git repository.
 * @function cloneRepository
 * @param {string} repositoryURL - The URL of the git repository.
 * @param {string} dirName - The name of the directory where the repository will be cloned.
 */
function cloneRepository(repositoryURL, dirName) {
	child_process.execSync(`git clone ${repositoryURL} .`, {
		cwd: path.resolve(process.cwd(), dirName), // path to where you want to save the file
	});
}

export default cloneGitRepository;

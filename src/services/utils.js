import * as fs from "node:fs";

/**
 * The name of the config file
 * @constant
 * @type {string}
 * @default
 */
export const RC_FILE_NAME = ".apimockrc";
/**
 * The name of the temporary folder
 * @constant
 * @type {string}
 * @default
 */
export const TEMP_FOLDER_NAME = ".api-mock-runner";
/**
 * Append text to .gitignore
 * @async
 * @function addToGitignore
 * @param {string} textToAppend - The text to append to .gitignore
 * @returns {Promise<void>}
 */
export async function addToGitignore(textToAppend) {
  // TODO: create function that validates if is already in gitignore
  fs.appendFile(`${process.cwd()}/.gitignore`, `\n${textToAppend}`, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`${textToAppend} added to .gitignore`);
    }
  });
}
/**
 * Verify if the origin is remote
 * @function verifyRemoteOrigin
 * @param {string} origin - The origin to verify
 * @returns {boolean} True if the origin is remote, false otherwise
 */
export function verifyRemoteOrigin(origin) {
  /*
   * NOTE: Regex explanation
   * - /^(git@|https:\/\/)/: This part of the regex specifies that the string must start with either "git@" or "https://".
   * - [^\s]+: This part ensures that there is at least one or more characters after "git@" or "https://". It matches any character except whitespace.
   * - (\.git)$: The regex ends with "\.git", ensuring that the string must end with ".git".
   */
  const isOriginRemoteRegex = /^(git@|https:\/\/)[^\s]+(\.git)$/;

  const isOriginRemote = isOriginRemoteRegex.test(origin);
  return isOriginRemote;
}
/**
 * Overwrites the document on a file
 * @async
 * @function overwriteFile
 * @param {string} filePath - The path of the file to overwrite
 * @param {string} content - The content to overwrite
 * @returns {Promise<void>}
 */
export async function overwriteFile(filePath, content) {
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Config saved");
    }
  });
}

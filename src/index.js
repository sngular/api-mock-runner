import { input, confirm, select } from "@inquirer/prompts";
import * as fs from "node:fs";
import OpenApiMocker from "open-api-mocker";
import cloneGitRepository from "./services/clone-git-repository.js";
import findOasFromDir from "./services/find-oas-from-dir.js";

// TODO: extract to configuration file?
const RC_FILE_NAME = ".apimockrc";
const TEMP_FOLDER_NAME = ".api-mock-runner";

/**
 * Main function to start the mock server
 * @async
 * @function main
 * @returns {Promise<void>}
 */
const main = async () => {
  let config;

  const configFileExists = fs.existsSync(`${process.cwd()}/${RC_FILE_NAME}`);

  if (configFileExists) {
    config = await initWithConfigFile();
  } else {
    config = await initNoConfigFile();
  }

  const schemas = await getSchemas(config.schemasOrigin);

  // TODO: change to checkboxes when multiple schemas are supported
  const selectedSchema = await select({
    message: "Select a schema",
    choices: schemas.map((schema) => {
      return { name: schema.fileName, value: schema.filePath };
    }),
  });

  await startMockServer(config.initialPort, selectedSchema);
};
main();

/**
 * User flow when the config file already exists
 * @async
 * @function initWithConfigFile
 * @returns {Promise<Config>} A object with the initial values from the user
 */
async function initWithConfigFile() {
  let config;
  const existingConfig = JSON.parse(
    fs.readFileSync(`${process.cwd()}/.apimockrc`)
  );
  console.table(existingConfig);
  const useExistingConfig = await confirm({
    message: "Do you want to use the existing config?",
  });

  if (useExistingConfig) {
    config = existingConfig;
  } else {
    config = await getInitialValues();
    overwriteFile(`${process.cwd()}/${RC_FILE_NAME}`, JSON.stringify(config));
  }
  return config;
}

/**
 * User flow when the config file doesn't exist
 * @async
 * @function initNoConfigFile
 * @returns {Promise<Config>} A object with the initial values from the user
 */
async function initNoConfigFile() {
  const config = await getInitialValues();
  // Create .apimockrc file
  const filePath = `${process.cwd()}/${RC_FILE_NAME}`;
  fs.writeFile(filePath, JSON.stringify(config), (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Config saved");
    }
  });
  const addRcFileToGitignore = await confirm({
    message: `Add ${RC_FILE_NAME} to .gitignore?`,
  });
  if (addRcFileToGitignore) {
    addToGitignore(RC_FILE_NAME);
  }
  return config;
}

/**
 * Get the schemas from the origin
 * @async
 * @function getSchemas
 * @param {string} origin - The origin of the schemas (local or remote)
 * @returns {Promise<Array>} An array of schemas
 */
async function getSchemas(origin) {
  const isOriginRemote = verifyRemoteOrigin(origin);

  if (isOriginRemote) {
    await cloneGitRepository(origin);
    addToGitignore(TEMP_FOLDER_NAME);
  }

  const schemasDir = isOriginRemote ? TEMP_FOLDER_NAME : origin;

  const schemas = await findOasFromDir(schemasDir);
  return schemas;
}

/**
 * Start the mock server
 * @async
 * @function startMockServer
 * @param {number} port - The port to start the mock server
 * @param {string} schema - The schema to mock
 * @returns {Promise<void>}
 */
async function startMockServer(port, schema) {
  const openApiMocker = new OpenApiMocker({
    port: port,
    schema: schema,
    watch: true,
  });

  await openApiMocker.validate();

  await openApiMocker.mock();
}

/**
 * @typedef {Object} Config
 * @property {string} schemasOrigin - The origin of the schemas (local or remote)
 * @property {number} initialPort - The initial port to start the mock server
 */

/**
 * get initial values from user
 * @async
 * @returns {Promise<Config>} A object with the initial values from the user
 */
async function getInitialValues() {
  // TODO: Add input validation
  const schemasOrigin = await input({
    message: "Enter the repo url or relative path",
  });
  const initialPort = await input({
    message: "Enter the initial port",
    default: 1234,
  });

  const config = {
    schemasOrigin,
    initialPort,
  };
  return config;
}

/**
 * Append text to .gitignore
 * @async
 * @function addToGitignore
 * @param {string} textToAppend - The text to append to .gitignore
 * @returns {Promise<void>}
 */
async function addToGitignore(textToAppend) {
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
function verifyRemoteOrigin(origin) {
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
async function overwriteFile(filePath, content) {
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Config saved");
    }
  });
}

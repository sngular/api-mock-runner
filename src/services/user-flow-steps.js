import { input, confirm } from "@inquirer/prompts";
import * as fs from "node:fs";
import OpenApiMocker from "open-api-mocker";
import cloneGitRepository from "../services/clone-git-repository.js";
import findOasFromDir from "../services/find-oas-from-dir.js";
import { addToGitignore, overwriteFile, verifyRemoteOrigin, TEMP_FOLDER_NAME, RC_FILE_NAME } from "./utils.js";
/**
 * @typedef {Object} Config
 * @property {string} schemasOrigin - The origin of the schemas (local or remote)
 * @property {number} initialPort - The initial port to start the mock server
 */

/**
 * User flow when the config file already exists
 * @async
 * @function initWithConfigFile
 * @returns {Promise<Config>} A object with the initial values from the user
 */
async function initWithConfigFile() {
	let config;
	const existingConfig = JSON.parse(
		fs.readFileSync(`${process.cwd()}/${RC_FILE_NAME}`)
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

export { initWithConfigFile, initNoConfigFile, getSchemas, startMockServer }

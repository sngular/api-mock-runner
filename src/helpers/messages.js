export const messages = Object.freeze({
	CHOOSE_FILES: 'Choose the files you want to use:',
	CONFIG_FILE_NOT_FOUND: 'Could not find the configuration file named:',
	CONFIRM_ADD_TO_GITIGNORE: (/** @type {string} */ fileName) => `Add ${fileName} to .gitignore?:`,
	CONFIRM_EXISTING_CONFIG: 'Do you want to use the existing config?:',
	CURRENT_CONFIG: 'Current configuration:',
	DIRECTORY_NOT_FOUND: 'Could not find the directory named:',
	INPUT_ORIGIN:
		'Enter a remote origin (https:// or git@) or a local path where the OpenAPI Specification files are located:',
	INPUT_PORT: (/** @type {string} */ schemaPath) => `Enter a port number for ${schemaPath}:`,
	OPENAPI_SCHEMA_NOT_FOUND_ERROR_MSG: 'No OpenAPI schema found in the given directory.',
	SAVED_CONFIG: (/** @type {string} */ configFile) => `Configuration saved in ${configFile}:`,
	SOME_SCHEMA_DOES_NOT_EXIST: 'Some schema does not exist.',
	USING_PROVIDED_CONFIG: 'Using provided configuration:',
});

export const validationErrorMessages = Object.freeze({
	origin: {
		INVALID: 'Enter a valid remote origin (https:// or git@) or local path.',
	},
	port: {
		IN_USE: 'Port already in use.',
		INVALID: 'Enter a valid port number between 0 and 65535.',
	},
});

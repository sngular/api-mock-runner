import fs from 'node:fs';

import { validationErrorMessages } from '../helpers/messages.js';
import { verifyHelper } from '../helpers/verify-remote-origin.js';

/**
 * @typedef {import('../types/types.d.js').Schema} Schema
 */

/**
 * Validate if the input is a valid local path or remote origin.
 * @function originValidator
 * @param {string} value - The value to validate.
 * @returns {boolean|string} True if the value is valid, otherwise a string with the error message.
 */
function originValidator(value) {
	const isLocalPath = fs.existsSync(value);
	const isRemoteOrigin = verifyHelper.verifyRemoteOrigin(value);
	const result = isLocalPath || isRemoteOrigin || validationErrorMessages.origin.INVALID;
	return result;
}

/**
 * Validate if the input is a valid port number.
 * @function portValidator
 * @param {string} input - The value to validate.
 * @param {Schema[]} selectedSchemas - The current schema.
 * @returns {boolean|string} True if the value is valid, otherwise a string with the error message.
 */
function portValidator(input, selectedSchemas) {
	const numericInput = Number(input);
	const isInteger = Number.isInteger(numericInput);
	if (!isInteger || numericInput < 0 || numericInput > 65535) {
		return validationErrorMessages.port.INVALID;
	}
	const isPortAlreadySelected = selectedSchemas.some((schema) => schema.port === numericInput);
	if (isPortAlreadySelected) {
		return validationErrorMessages.port.IN_USE;
	}
	return true;
}

export const inquirerValidators = { originValidator, portValidator };

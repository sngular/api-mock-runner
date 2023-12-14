import fs from 'fs';

import { verifyRemoteOrigin } from './utils.js';

/**
 * @typedef {import('../types/types.d.js').Schema} Schema
 */

export const errorMessages = Object.freeze({
	origin: {
		INVALID: 'Enter a valid remote origin (https:// or git@) or local path',
	},
	port: {
		IN_USE: 'Port already in use',
		INVALID: 'Enter a valid port number between 0 and 65535',
	},
});

/**
 * Validate if the input is a valid local path or remote origin.
 * @function originValidator
 * @param {string} value - The value to validate.
 * @returns {boolean|string} True if the value is valid, otherwise a string with the error message.
 */
export function originValidator(value) {
	const isLocalPath = fs.existsSync(value);
	const isRemoteOrigin = verifyRemoteOrigin(value);
	const result = isLocalPath || isRemoteOrigin || errorMessages.origin.INVALID;
	return result;
}

/**
 * Validate if the input is a valid port number.
 * @function portValidator
 * @param {string} input - The value to validate.
 * @param {Schema[]} selectedSchemas - The current schema.
 * @returns {boolean|string} True if the value is valid, otherwise a string with the error message.
 */
export function portValidator(input, selectedSchemas) {
	const numericInput = Number(input);
	const isInteger = Number.isInteger(numericInput);
	if (!isInteger || numericInput < 0 || numericInput > 65535) {
		return errorMessages.port.INVALID;
	}
	const isPortAlreadySelected = selectedSchemas.some((schema) => schema.port === numericInput);
	if (isPortAlreadySelected) {
		return errorMessages.port.IN_USE;
	}
	return true;
}

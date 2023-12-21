import { colours, paintText } from '../helpers/colours.js';
import Logger from '../helpers/logger.js';

/**
 * The name of the config file.
 * @constant
 * @type {string}
 * @default
 */
export const RC_FILE_NAME = '.apimockrc';

/**
 * The name of the temporary folder.
 * @constant
 * @type {string}
 * @default
 */
export const TEMP_FOLDER_NAME = '.api-mock-runner/';

/**
 * Verify if the origin is remote.
 * @function verifyRemoteOrigin
 * @param {string} origin - The origin to verify.
 * @returns {boolean} True if the origin is remote, false otherwise.
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

export default {
	RC_FILE_NAME,
	TEMP_FOLDER_NAME,
	verifyRemoteOrigin,
};

export class MockRunnerError extends Error {
	/**
	 * Error class for the project.
	 * @class
	 * @param {string} message - Display message.
	 * @param {number} code - HTTP code for easy identification problem.
	 * @param {number} level - Severity of the error [low = 0, medium = 1, critical = 2].
	 * @param {string} emitter - Name of the function origin.
	 * @param {object} opt - Options default object on the Error node class.
	 */
	constructor(message, code, level = 0, emitter, opt = {}) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = this.constructor.name;
		this.emitter = emitter;
		this.opt = opt;
		this.code = code;
		this.level = level;
		Error.captureStackTrace(this);
	}

	/**
	 * Shows the error information on the log on a tidy way.
	 */
	showError() {
		let type = '';
		switch (this.level) {
			case 2:
				type = colours.fg.red;
				break;
			case 1:
				type = colours.fg.crimson;
				break;
			default:
				type = colours.fg.cyan;
		}
		Logger.error(
			`Error of level ${paintText(this.level.toString(), type)}, type ${paintText(
				this.code.toString(),
				colours.fg.gray
			)} over ${paintText(this.emitter, colours.fg.blue)}`
		);
		Logger.info(`${this.stack}`);
	}
}

const formatCodes = Object.freeze({
	color: {
		RED: '\x1b[31m',
		YELLOW: '\x1b[33m',
		BLUE: '\x1b[34m',
	},
	style: {
		UNDERLINE: '\x1b[4m',
	},
	RESET: '\x1b[0m',
});

const logType = Object.freeze({
	INFO: `${formatCodes.color.BLUE}[INFO]${formatCodes.RESET}`,
	WARN: `${formatCodes.color.YELLOW}[WARNING]${formatCodes.RESET}`,
	ERROR: `${formatCodes.color.RED}[ERROR]${formatCodes.RESET}`,
});

/**
 * A utility class for logging messages to the console.
 */
export default class Logger {
	/* eslint-disable no-console */

	/**
	 * Logs an informational message to the console.
	 * @param {string} message - The message to log.
	 * @param {string|object} [extra] - Additional information to log.
	 */
	static info(message, extra = '') {
		this.#printMessage(logType.INFO, message, extra);
	}

	/**
	 * Logs a warning message to the console.
	 * @param {string} message - The message to log.
	 * @param {string|object} [extra] - Additional information to log.
	 */
	static warn(message, extra = '') {
		this.#printMessage(logType.WARN, message, extra);
	}

	/**
	 * Logs an error message to the console.
	 * @param {string} message - The message to log.
	 * @param {string|object} [extra] - Additional information to log.
	 */
	static error(message, extra = '') {
		this.#printMessage(logType.ERROR, message, extra);
	}

	/**
	 * Logs an empty line to the console.
	 */
	static emptyLine() {
		console.log();
	}

	/**
	 * Private method for printing a message to the console.
	 * @param {string} type - The type of message to log.
	 * @param {string} message - The message to log.
	 * @param {string|object} extra - Additional information to log.
	 */
	static #printMessage(type, message, extra) {
		console.log(`${type} ${message} ${this.#getExtraFormatted(extra)}`);
		if (typeof extra === 'object') {
			console.log(extra);
		}
	}

	/**
	 * Private method for formatting the extra parameter.
	 * @param {string|object} extraParameter - The extra parameter to format.
	 * @returns {string} The formatted extra parameter.
	 */
	static #getExtraFormatted(extraParameter) {
		if (!extraParameter || typeof extraParameter === 'object') {
			return '';
		}
		return `${formatCodes.style.UNDERLINE}${extraParameter}${formatCodes.RESET}`;
	}
}

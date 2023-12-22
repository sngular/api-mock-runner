import { colours, paintText } from '../helpers/colours.js';
import Logger from '../helpers/logger.js';

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

import { expect, use } from 'chai';
import sinonChai from 'sinon-chai';

import { colours, paintText } from '../../../src/helpers/colours.js';

use(sinonChai);

describe('unit: colours', () => {
	beforeEach(() => {});

	afterEach(() => {});

	it('should have the correct colours', () => {
		expect(colours).to.deep.equal({
			reset: '\x1b[0m',
			bright: '\x1b[1m',
			dim: '\x1b[2m',
			underscore: '\x1b[4m',
			blink: '\x1b[5m',
			reverse: '\x1b[7m',
			hidden: '\x1b[8m',
			fg: {
				black: '\x1b[30m',
				red: '\x1b[31m',
				green: '\x1b[32m',
				yellow: '\x1b[33m',
				blue: '\x1b[34m',
				magenta: '\x1b[35m',
				cyan: '\x1b[36m',
				white: '\x1b[37m',
				gray: '\x1b[90m',
				crimson: '\x1b[38m',
			},
			bg: {
				black: '\x1b[40m',
				red: '\x1b[41m',
				green: '\x1b[42m',
				yellow: '\x1b[43m',
				blue: '\x1b[44m',
				magenta: '\x1b[45m',
				cyan: '\x1b[46m',
				white: '\x1b[47m',
				gray: '\x1b[100m',
				crimson: '\x1b[48m',
			},
		});
	});

	describe('paintText', () => {
		it('should return the text with the specified color', () => {
			const text = 'Hello, World!';
			const color = colours.fg.red;
			const expected = `${color}${text}${colours.reset}`;
			const result = paintText(text, color);
			expect(result).to.equal(expected);
		});
	});
});
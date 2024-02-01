/**
 * Iterator for readline interface.
 * @param {string} [str] The file content to yield line by line.
 * @yields {string} The read line of the file.
 */
export async function* fileContentIterator(str) {
	if (!str) {
		yield str;
	}
	const lines = str.split('\n');
	for (const objChild of lines) {
		yield objChild;
	}
}

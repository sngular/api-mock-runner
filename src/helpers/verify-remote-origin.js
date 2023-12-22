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

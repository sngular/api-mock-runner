/**
 * @typedef {object} Config
 * @property {string=} schemasOrigin - The origin of the schemas (local or remote).
 * @property {Schema[]} selectedSchemas - An array of schemas.
 * @property {number[]=} ports - The initial port to start the mock server.
 */

/**
 * @typedef {object} ProgramOptions
 * @property {string} origin - The origin of the schemas (local or remote).
 * @property {string[]} schema - Local schema paths.
 * @property {string[]} port - An array of ports.
 * @property {boolean} runConfig - Use saved config.
 */

/**
 * @typedef {object} Options
 * @property {string=} origin - The origin of the schemas (local or remote).
 * @property {string[]} schemaPaths - Local schema paths.
 * @property {string[]} ports - An array of ports.
 */

/**
 * @typedef {object} Schema
 * @property {string} path - The path of the schema.
 * @property {number} port - The port for the schema.
 */

/**
 * @typedef {object} OasFile The OAS file.
 * @property {string} fileName The name of the file.
 * @property {string} path The path to the file.
 * @property {string} filePath The path to the file.
 */

/**
 * @typedef {object} OpenApiMockerOptions
 * @property {number} port - The port to serve the schema.
 * @property {string} schema - The path to the schema.
 * @property {boolean} watch - Watch for changes in the schema.
 */

export {};

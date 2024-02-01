import { expect, use } from 'chai';
import esmock from 'esmock';
import { createSandbox } from 'sinon';
import sinonChai from 'sinon-chai';

import { globalMocksFactory } from '../../../helpers/global-mocks-factory.js';

use(sinonChai);
const sandbox = createSandbox();

const askForPorts = sandbox.stub();
const saveRuntimeConfig = sandbox.stub();
class Logger {
	static info = sandbox.stub();
}
const mocks = {
	'../../helpers/logger.js': { Logger },
	'../../services/user-flow-steps/helpers.js': { askForPorts, saveRuntimeConfig },
};
const globalMocks = globalMocksFactory(sandbox);
const fileToTest = '../../../../src/services/user-flow-steps/init-with-schema-paths.js';
const absolutePath = new URL(fileToTest, import.meta.url).pathname;
const { initWithSchemaPaths } = await esmock(absolutePath, absolutePath, mocks, globalMocks);

describe('unit: user-flow-steps', () => {
	const localSchema = {
		filename: 'oas.yml',
		path: '/path/to/',
		filePath: '/path/to/oas.yml',
		port: 1234,
		nextPort: 1235,
	};
	const expectedConfigMock = {
		schemasOrigin: '/path/to/',
		selectedSchemas: [{ path: '/path/to/oas.yml', port: 1234 }],
	};

	afterEach(() => {
		sandbox.reset();
	});

	describe('initWithSchemaPaths', () => {
		const schemaPaths = [localSchema.filePath];
		const ports = [localSchema.port];
		const expectedConfigMockWithoutOrigin = { ...expectedConfigMock };
		delete expectedConfigMockWithoutOrigin.schemasOrigin;

		it('should init with schema paths and same length of schemas and ports', async () => {
			const config = await initWithSchemaPaths({ schemaPaths, ports });
			expect(config).to.deep.equal(expectedConfigMockWithoutOrigin);
		});

		it('should init with two schema paths and one port', async () => {
			const config = await initWithSchemaPaths({
				schemaPaths: [localSchema.filePath, localSchema.filePath],
				ports: [localSchema.port],
			});

			expect(config).to.deep.equal({
				selectedSchemas: [
					{ path: localSchema.filePath, port: localSchema.port },
					{ path: localSchema.filePath, port: localSchema.nextPort },
				],
			});
		});

		it('should init with schema paths but no ports', async () => {
			askForPorts.resolves([{ path: localSchema.filePath, port: localSchema.port }]);
			const config = await initWithSchemaPaths({
				schemaPaths: [localSchema.filePath],
			});
			expect(config).to.deep.equal(expectedConfigMockWithoutOrigin);
		});

		it('should save runtime config', async () => {
			await initWithSchemaPaths({ schemaPaths, ports });
			expect(saveRuntimeConfig).to.have.been.calledOnceWithExactly(expectedConfigMockWithoutOrigin);
		});
	});
});

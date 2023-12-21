import { expect, use } from 'chai';
import esmock from 'esmock';
import fs from 'node:fs';
import path from 'node:path';
import { match, stub } from 'sinon';
import sinonChai from 'sinon-chai';

import { OpenApiSchemaNotFoundError } from '../../../src/errors/openapi-schema-not-found-error.js';
import Logger from '../../../src/helpers/logger.js';

use(sinonChai);

let inquirerInputStub = stub();
let inquirerCheckboxStub = stub();
let inquirerConfirmStub = stub();
let gitignoreStub = stub();
let cloneGitRepositoryStub = stub();
let findOasFromDirStub = stub();
let findOasFromDirRecursiveStub = stub();
const { userFlowSteps } = await esmock('../../../src/services/user-flow-steps.js', import.meta.url, {
	'@inquirer/prompts': {
		input: (...args) => inquirerInputStub(...args),
		checkbox: (...args) => inquirerCheckboxStub(...args),
		confirm: (...args) => inquirerConfirmStub(...args),
	},
	'../../../src/services/gitignore.js': {
		default: gitignoreStub,
	},
	'../../../src/services/clone-git-repository.js': {
		default: cloneGitRepositoryStub,
	},
	'../../../src/services/find-oas-from-dir.js': {
		findOasFromDir: findOasFromDirStub,
		findOasFromDirRecursive: findOasFromDirRecursiveStub,
	},
});

describe('unit: user-flow-steps', () => {
	const remoteOrigin = 'git@example.git';
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

	let fsReadFileSyncStub;
	let fsWriteFileSyncStub;
	let loggerInfoStub;
	let pathResolveStub;

	beforeEach(() => {
		fsReadFileSyncStub = stub(fs, 'readFileSync');
		fsWriteFileSyncStub = stub(fs, 'writeFileSync');
		loggerInfoStub = stub(Logger, 'info');
		pathResolveStub = stub(path, 'resolve');
	});

	afterEach(() => {
		cloneGitRepositoryStub.reset();
		fsReadFileSyncStub.restore();
		fsWriteFileSyncStub.restore();
		gitignoreStub.reset();
		inquirerCheckboxStub.reset();
		inquirerConfirmStub.reset();
		inquirerInputStub.reset();
		loggerInfoStub.restore();
		pathResolveStub.restore();
	});

	describe('init', () => {
		it('should throw OpenApiSchemaNotFoundError if no schemas are found with remote origin', async () => {
			inquirerInputStub.resolves(remoteOrigin);
			findOasFromDirRecursiveStub.resolves([]);
			try {
				await userFlowSteps.init();
			} catch (error) {
				expect(error).to.be.an.instanceOf(OpenApiSchemaNotFoundError);
			}
		});

		it('should throw OpenApiSchemaNotFoundError if no schemas are found with local origin', async () => {
			inquirerInputStub.resolves(localSchema.filePath);
			pathResolveStub.returns(localSchema.filePath);
			findOasFromDirStub.resolves([]);
			try {
				await userFlowSteps.init();
			} catch (error) {
				expect(error).to.be.an.instanceOf(OpenApiSchemaNotFoundError);
			}
		});

		it('should return the config using local available paths', async () => {
			findOasFromDirStub.resolves([localSchema]);
			const config = await userFlowSteps.init({
				origin: localSchema.path,
				schemaPaths: [localSchema.filePath],
				ports: [1234],
			});
			expect(findOasFromDirStub).to.have.been.calledWith(localSchema.path);
			expect(fsWriteFileSyncStub).to.have.been.calledWith(match.string, match.string);
			expect(loggerInfoStub).to.have.been.calledWith(match.string, match.object);
			expect(gitignoreStub).to.have.been.calledWith(match.string);
			expect(config).to.deep.equal(expectedConfigMock);
		});

		it('should return the config using local origin only', async () => {
			findOasFromDirStub.resolves([localSchema]);
			inquirerCheckboxStub.resolves([localSchema.filePath]);
			inquirerInputStub.resolves(localSchema.port);
			const config = await userFlowSteps.init({
				origin: localSchema.path,
				port: [],
				schemaPaths: [],
			});
			expect(findOasFromDirStub).to.have.been.calledWith(localSchema.path);
			expect(inquirerCheckboxStub).to.have.been.calledWith(match.object);
			expect(inquirerInputStub).to.have.been.calledWith(match.object);
			expect(config).to.deep.equal(expectedConfigMock);
		});
	});

	describe('initWithConfigFile', () => {
		let initStub;

		beforeEach(() => {
			initStub = stub(userFlowSteps, 'init');
		});

		afterEach(() => {
			initStub.restore();
		});

		it('should init with config file', async () => {
			fsReadFileSyncStub.returns(JSON.stringify(expectedConfigMock));
			inquirerConfirmStub.resolves(true);
			const config = await userFlowSteps.initWithConfigFile();
			expect(fsReadFileSyncStub).to.have.been.calledWith(match.string);
			expect(config).to.deep.equal(expectedConfigMock);
		});

		it('should not init with config file and start a new user flow', async () => {
			fsReadFileSyncStub.returns(JSON.stringify(expectedConfigMock));
			inquirerConfirmStub.resolves(false);
			await userFlowSteps.initWithConfigFile();
			expect(fsReadFileSyncStub).to.have.been.calledWith(match.string);
			expect(initStub).to.have.been.called;
		});
	});

	describe('initWithSchemaPaths', () => {
		const schemaPaths = [localSchema.filePath];
		const ports = [localSchema.port];
		const expectedConfigMockWithoutOrigin = { ...expectedConfigMock };
		delete expectedConfigMockWithoutOrigin.schemasOrigin;

		it('should init with schema paths and same length of schemas and ports', async () => {
			const config = await userFlowSteps.initWithSchemaPaths({
				schemaPaths,
				ports,
			});
			expect(config).to.deep.equal(expectedConfigMockWithoutOrigin);
			expect(fsWriteFileSyncStub).to.have.been.calledWith(match.string, match.string);
		});

		it('should init with two schema paths and one port', async () => {
			const config = await userFlowSteps.initWithSchemaPaths({
				schemaPaths: [localSchema.filePath, localSchema.filePath],
				ports: [localSchema.port],
			});

			expect(config).to.deep.equal({
				selectedSchemas: [
					{ path: localSchema.filePath, port: localSchema.port },
					{ path: localSchema.filePath, port: localSchema.nextPort },
				],
			});
			expect(fsWriteFileSyncStub).to.have.been.calledWith(match.string, match.string);
		});

		it('should init with schema paths but no ports', async () => {
			inquirerInputStub.resolves(localSchema.port);
			const config = await userFlowSteps.initWithSchemaPaths({
				schemaPaths: [localSchema.filePath],
			});
			expect(config).to.deep.equal(expectedConfigMockWithoutOrigin);
			expect(fsWriteFileSyncStub).to.have.been.calledWith(match.string, match.string);
		});

		inquirerInputStub.resolves(localSchema.port);
	});
});

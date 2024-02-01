export const globalMocksFactory = (sandbox) => ({
	child_process: {
		execSync: sandbox.stub(),
	},
	fs: {
		createReadStream: sandbox.stub(),
		existsSync: sandbox.stub(),
		mkdirSync: sandbox.stub(),
		rmSync: sandbox.stub(),
		readdirSync: sandbox.stub(),
		lstatSync: sandbox.stub(),
		appendFileSync: sandbox.stub(),
		readFileSync: sandbox.stub(),
		writeFileSync: sandbox.stub(),
	},
	readline: {
		createInterface: sandbox.stub(),
	},
	path: {
		join: sandbox.stub(),
		resolve: sandbox.stub(),
	},
});

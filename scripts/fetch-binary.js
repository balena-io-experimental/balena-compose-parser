/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');
const { promises: fs } = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const zlib = require('zlib');
const tar = require('tar');
const packageJson = require('../package.json');
/* eslint-enable @typescript-eslint/no-require-imports */

const streamPipeline = promisify(pipeline);

async function exists(p) {
	return await fs
		.access(p, fs.constants.F_OK)
		.then(() => true)
		.catch(() => false);
}

function getPlatform() {
	const platform = process.platform;
	switch (platform) {
		case 'darwin':
			return 'darwin';
		case 'linux':
			return 'linux';
		case 'win32':
			return 'windows';
		default:
			throw new Error(`Unsupported platform: ${platform}`);
	}
}

function getArch() {
	const arch = process.arch;
	switch (arch) {
		case 'x64':
			return 'amd64';
		case 'arm64':
			return 'arm64';
		default:
			throw new Error(`Unsupported architecture: ${arch}`);
	}
}

function getBinaryUrl() {
	const config = packageJson.binary;
	if (!config) {
		throw new Error('No binary configuration found in package.json');
	}

	const platform = getPlatform();
	const arch = getArch();
	const version = packageJson.version;

	const packageName = config.packageName
		.replace('{platform}', platform)
		.replace('{arch}', arch);

	const url = config.remotePath.replace('{version}', version) + packageName;

	return url;
}

function downloadFile(url, logHost = true) {
	return new Promise((resolve, reject) => {
		// Truncate url to host only
		if (logHost) {
			console.log(`Downloading binary from: ${url.split('?')[0]}`);
		}

		https
			.get(url, (response) => {
				if (response.statusCode === 302 || response.statusCode === 301) {
					// Follow redirect
					return downloadFile(response.headers.location, false)
						.then(resolve)
						.catch(reject);
				}

				if (response.statusCode !== 200) {
					reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
					return;
				}

				resolve(response);
			})
			.on('error', reject);
	});
}

async function extractTarGz(stream, targetDir) {
	await streamPipeline(
		stream,
		zlib.createGunzip(),
		tar.extract({
			cwd: targetDir,
			strip: 0,
		}),
	);
}

async function fetchBinary() {
	try {
		const config = packageJson.binary;
		const binDir = path.join(__dirname, '..', config.modulePath);
		const binaryName = `${config.moduleName}${process.platform === 'win32' ? '.exe' : ''}`;
		const binaryPath = path.join(binDir, binaryName);

		// Create bin directory if it doesn't exist
		if (!(await exists(binDir))) {
			await fs.mkdir(binDir, { recursive: true });
		}

		// Download binary
		const url = getBinaryUrl();
		const response = await downloadFile(url);

		// Extract tar.gz to bin directory
		console.log(`Extracting binary to ${binDir}`);
		await extractTarGz(response, binDir);

		// Make binary executable on Unix systems
		if (process.platform !== 'win32') {
			await fs.chmod(binaryPath, 0o755);
		}

		console.log(`Binary successfully installed at ${binaryPath}`);
	} catch (error) {
		console.error(`Failed to fetch binary: ${error.message}`);
	}
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
	if (process.env.BUILD_FROM_SOURCE === 'true') {
		console.log('Building Go binary from source');
		process.exit(1);
	}
	try {
		await fetchBinary();
		process.exit(0);
	} catch {
		process.exit(1);
	}
})();

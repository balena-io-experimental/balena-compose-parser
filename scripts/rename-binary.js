#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const binDir = path.join(__dirname, '..', 'bin');

if (!fs.existsSync(binDir)) {
	console.debug('Binary directory does not exist, skipping rename');
	process.exit(0);
}

// Find file matching balena_compose_parser.node
const files = fs.readdirSync(binDir).filter(f => f.match(/^balena_compose_parser\.node$/));

if (files.length === 0) {
	console.debug('No binary file found, skipping rename');
	process.exit(0);
}

const sourceFile = path.join(binDir, files[0]);
const targetFile = path.join(binDir, `balena_compose_parser${process.platform === 'win32' ? '.exe' : ''}`);

// Rename the file
try {
	fs.renameSync(sourceFile, targetFile);
	console.debug('Binary file renamed successfully');
} catch (err) {
	console.error(`Failed to rename binary file: ${err.message}`);
	process.exit(1);
}
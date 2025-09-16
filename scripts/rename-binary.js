#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const binDir = path.join(__dirname, '..', 'bin');

if (!fs.existsSync(binDir)) {
	process.exit(0);
}

// Find file matching balena_compose_go.node
const files = fs.readdirSync(binDir).filter(f => f.match(/^balena_compose_go\.node$/));

if (files.length === 0) {
	process.exit(0);
}

const sourceFile = path.join(binDir, files[0]);
const targetFile = path.join(binDir, `balena_compose_go${process.platform === 'win32' ? '.exe' : ''}`);

// Rename the file
try {
	fs.renameSync(sourceFile, targetFile);
} catch (err) {
	console.error(`Failed to rename binary file: ${err.message}`);
	process.exit(1);
}
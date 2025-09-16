#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const binDir = path.join(__dirname, '..', 'bin');

if (!fs.existsSync(binDir)) {
	process.exit(0);
}

// Find any file matching balena-compose-go*.node
const files = fs.readdirSync(binDir).filter(f => f.match(/^balena-compose-go.*\.node$/));

if (files.length === 0) {
	process.exit(0);
}

const sourceFile = path.join(binDir, files[0]);
const targetFile = path.join(binDir, `balena-compose-go${process.platform === 'win32' ? '.exe' : ''}`);

// Rename the file
try {
	fs.renameSync(sourceFile, targetFile);
	console.log(`Renamed ${files[0]} to ${path.basename(targetFile)}`);
} catch (err) {
	console.error(`Failed to rename file: ${err.message}`);
	process.exit(1);
}
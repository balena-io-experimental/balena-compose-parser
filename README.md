# balena-compose-parser

A TypeScript wrapper around [compose-go](https://github.com/compose-spec/compose-go) that parses and validates Docker Compose files for balena applications.

## Overview

This project provides a Node.js library that uses a Go binary (built from compose-go) to parse Docker Compose files and normalize them for use with balena. It handles:

- Parsing standard Docker Compose files
- Validating balena-specific constraints
- Converting compose configurations to balena-compatible formats
- Transforming compositions into image descriptors for building/pulling

## Requirements

- Node.js 20+
- Go 1.25+ (for local builds)

## Installation
```
npm i @balena/compose-parser
```

## Architecture

The project consists of two main components:

1. **Go Binary** (`lib/main.go`): A wrapper around compose-go that outputs structured JSON
2. **TypeScript Library** (`lib/`): Node.js library that calls the Go binary and processes results

## Building

```bash
# Build everything
npm run build

# Build Go binary only
npm run build:go
```

## Testing

### Unit Tests
```bash
npm run test
```
Runs TypeScript unit tests that test the library functions directly. This does not cover the entirety of the functionality, as due to CI constraints, tests using the Go binary are performed in Docker.

### Integration Tests
```bash
npm run test:compose

# Or the following if running build:go first:
npm run test:integration
```

The integration tests validate the functionality of the compose-go wrapper for parsing input compose files. `npm run test:compose` is for running the tests in Docker, but the tests can be run directly if a built Go binary is available as generated from `npm run build:go`.

## Development Scripts

```bash
# Check for linting issues
npm run lint

# Fix auto-fixable linting issues
npm run lint-fix
```

## API

### Basic Usage

```typescript
import { parse, defaultComposition, toImageDescriptors } from '@balena/compose-parser';

// Parse a compose file
const composition = await parse('docker-compose.yml');

// Parse multiple compose files (later files override earlier ones)
const composition = await parse([
  'docker-compose.yml', 
  'docker-compose.override.yml'
]);

// Convert composition to image descriptors for building/pulling
const imageDescriptors = toImageDescriptors(composition);
```

### Image Descriptors

The `toImageDescriptors()` function converts a composition into descriptors that can be used for image operations:

```typescript
const descriptors = toImageDescriptors(composition);
// Returns array of:
// {
//   serviceName: string,
//   image: string | BuildConfig,
//   contract?: ContractObject  // if service has contract requirement labels
// }
```

## Balena-Specific Features

### Contract Labels

Supports validation of contract requirement labels:
- `io.balena.features.requires.sw.supervisor`: Semver range for Supervisor version
- `io.balena.features.requires.hw.device-type`: Device type slug
- `io.balena.features.requires.arch.sw`: Architecture (`aarch64`, `amd64`, `armv7hf`, etc.)
- `io.balena.features.requires.sw.l4t`: L4T version range
import { expect } from 'chai';

import { toImageDescriptors } from '../lib/index';
import type { Composition } from '../lib/index';

describe('toImageDescriptors', () => {
	it('should include contract objects for services with contract requirement labels', () => {
		const composition: Composition = {
			services: {
				app: {
					image: 'myapp:latest',
					labels: {
						'io.balena.features.requires.sw.supervisor': '>=16.0.0',
						'io.balena.features.requires.hw.device-type': 'raspberrypi4-64',
						'io.balena.other.label': 'value',
					},
				},
				db: {
					image: 'postgres:13',
					labels: {
						'io.balena.features.requires.arch.sw': 'aarch64',
						'io.balena.features.requires.sw.l4t': '32.4.4',
					},
				},
			},
		};

		const descriptors = toImageDescriptors(composition);

		expect(descriptors).to.have.lengthOf(2);

		expect(descriptors[0]).to.deep.equal({
			serviceName: 'app',
			image: 'myapp:latest',
			contract: {
				type: 'sw.container',
				slug: 'contract-for-app',
				requires: [
					{ type: 'sw.supervisor', version: '>=16.0.0' },
					{ type: 'hw.device-type', slug: 'raspberrypi4-64' },
				],
			},
		});

		expect(descriptors[1]).to.deep.equal({
			serviceName: 'db',
			image: 'postgres:13',
			contract: {
				type: 'sw.container',
				slug: 'contract-for-db',
				requires: [
					{ type: 'arch.sw', slug: 'aarch64' },
					{ type: 'sw.l4t', version: '32.4.4' },
				],
			},
		});
	});

	it('should not include contract for services without contract requirement labels', () => {
		const composition: Composition = {
			services: {
				app: {
					image: 'myapp:latest',
					labels: {
						'io.balena.features.dbus': '1',
						'io.balena.other.label': 'value',
					},
				},
			},
		};

		const descriptors = toImageDescriptors(composition);

		expect(descriptors).to.have.lengthOf(1);
		expect(descriptors[0]).to.deep.equal({
			serviceName: 'app',
			image: 'myapp:latest',
		});
	});

	it('should handle mixed service configurations', () => {
		const composition: Composition = {
			services: {
				web: {
					image: 'nginx:alpine',
				},
				app: {
					build: {
						context: './app',
					},
					labels: {
						'io.balena.features.requires.sw.supervisor': '>=2.5.0',
					},
				},
				cache: {
					image: 'redis:7',
					labels: {
						'io.balena.features.requires.arch.sw': 'amd64',
					},
				},
			},
		};

		const descriptors = toImageDescriptors(composition);

		expect(descriptors).to.have.lengthOf(3);

		expect(descriptors[0]).to.deep.equal({
			serviceName: 'web',
			image: 'nginx:alpine',
		});

		expect(descriptors[1]).to.deep.equal({
			serviceName: 'app',
			image: {
				context: './app',
			},
			contract: {
				type: 'sw.container',
				slug: 'contract-for-app',
				requires: [{ type: 'sw.supervisor', version: '>=2.5.0' }],
			},
		});

		expect(descriptors[2]).to.deep.equal({
			serviceName: 'cache',
			image: 'redis:7',
			contract: {
				type: 'sw.container',
				slug: 'contract-for-cache',
				requires: [{ type: 'arch.sw', slug: 'amd64' }],
			},
		});
	});
});

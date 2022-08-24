import getUniques from '../tools/getUniques.js';
import glob from 'glob';

const DEFAULT_IGNORES = ['**/*.bundle.*', '*lock*', 'node_modules/**/*'];

const createPromise = (config) => (pattern) =>
	new Promise((resolve, reject) => {
		glob(pattern.replace(/\\/g, '/'), config, async (err, files) => {
			if (err) {
				reject(err);
			}
			resolve(files);
		});
	});

export default async (globs, realpath = true) => {
	const definitivePatterns = new Set();
	const definitiveIgnores = new Set(DEFAULT_IGNORES);

	getUniques(globs).forEach((pattern) => {
		if (pattern.startsWith('!')) {
			definitiveIgnores.add(pattern.slice(1));
		} else {
			definitivePatterns.add(pattern);
		}
	});

	const config = {
		ignore: Array.from(definitiveIgnores),
		mark: true,
		nodir: true,
		realpath
	};

	const allFiles = await Promise.all(
		Array.from(definitivePatterns).map(createPromise(config))
	);

	return getUniques(allFiles);
};

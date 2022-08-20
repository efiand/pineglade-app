import { Pattern } from '../constants.js';
import ensureArray from '../tools/ensureArray.js';
import glob from 'glob';

const config = {
	mark: true,
	nodir: true,
	realpath: true
};

export default async (patterns) => {
	const definitivePatterns = new Set();
	const definitiveIgnores = new Set(Pattern.DEFAULT_IGNORE);

	ensureArray(patterns)
		.flat(Infinity)
		.forEach((pattern) => {
			if (pattern.startsWith('!')) {
				definitiveIgnores.add(pattern.slice(1));
			} else {
				definitivePatterns.add(pattern);
			}
		});

	const allFiles = await Promise.all(
		Array.from(definitivePatterns).map(
			(pattern) =>
				new Promise((resolve, reject) => {
					glob(
						pattern.replace(/\\/g, '/'),
						{
							...config,
							ignore: Array.from(definitiveIgnores)
						},
						async (err, files) => {
							if (err) {
								reject(err);
							}

							resolve(files);
						}
					);
				})
		)
	);

	return Array.from(new Set(allFiles.flat(Infinity)));
};

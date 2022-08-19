import ensureArray from '../tools/ensureArray.js';
import glob from 'glob';

const config = {
	ignore: ['**/*.bundle.*', 'node_modules/**/*'],
	mark: true,
	nodir: true,
	realpath: true
};

export default async (patterns, handleFile = null) => {
	const allFiles = await Promise.all(
		Array.from(new Set(ensureArray(patterns))).map(
			(pattern) =>
				new Promise((resolve, reject) => {
					glob(pattern.replace(/\\/g, '/'), config, async (err, files) => {
						if (err) {
							reject(err);
						}

						if (typeof handleFile === 'function') {
							await Promise.all(files.map(handleFile));
						}

						resolve(files);
					});
				})
		)
	);

	return Array.from(new Set(allFiles.flat(Infinity)));
};

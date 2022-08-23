import { Dest } from '../constants.js';
import { cp } from 'fs/promises';
import getPathsFromGlobs from '../lib/getPathsFromGlobs.js';
import log from '../lib/log.js';
import path from 'path';

const LOG_TITLE = 'Copy';

export default async (globs) => {
	const files = await getPathsFromGlobs(globs);
	if (!files.length) {
		return;
	}

	await Promise.all(
		files.map(async (file) => {
			const subPath = file.replace(/^.*?source(\\|\/)(.*)/, '$2');

			await cp(file, path.resolve(Dest.MAIN, subPath));

			log.success(`${subPath} successfully copied.`, LOG_TITLE);
		})
	);
};

import { Dest } from '../constants.js';
import getPathsFromGlobs from './getPathsFromGlobs.js';
import log from './log.js';
import path from 'path';
import { readFile } from 'fs/promises';
import writeFileSmart from './writeFileSmart.js';

const LOG_TITLE = 'PostCSS';

export default async (globs, postcss) => {
	const files = await getPathsFromGlobs(globs);
	if (!files.length) {
		return;
	}

	log.info('>> Building styles begins...', LOG_TITLE);

	try {
		await Promise.all(
			files.map(async (file) => {
				const sourceCSS = await readFile(file, 'utf-8');
				const { css } = await postcss.process(sourceCSS, {
					from: file,
					map: false
				});

				const bundleName = path.basename(file, '.css');
				await writeFileSmart(`${Dest.CSS}/${bundleName}.bundle.css`, css);
			})
		);

		log.success('<< Styles successfully builded.', LOG_TITLE);
	} catch (err) {
		log.error(err, LOG_TITLE);
	}
};

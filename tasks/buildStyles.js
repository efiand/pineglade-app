import { Dest, cssnanoOptions, isDev } from '../constants.js';
import autoprefixer from 'autoprefixer';
import calc from 'postcss-calc';
import cssnano from 'cssnano';
import easyImport from 'postcss-easy-import';
import log from '../lib/log.js';
import mixins from 'postcss-mixins';
import mqpacker from 'postcss-sort-media-queries';
import nested from 'postcss-nested';
import path from 'path';
import postcss from 'postcss';
import postcssFunctions from 'postcss-functions';
import postcssMedia from 'postcss-custom-media';
import { readFile } from 'fs/promises';
import simpleVars from 'postcss-simple-vars';
import writeFileSmart from '../lib/writeFileSmart.js';

const LOG_TITLE = 'PostCSS';
let processor = null;

const configure = ({ customMedia = null, functions = null }) => {
	processor = postcss().use(easyImport).use(simpleVars).use(mixins);

	if (functions) {
		processor.use(postcssFunctions({ functions }));
	}

	processor.use(nested);

	if (customMedia) {
		processor.use(postcssMedia(customMedia));
	}

	processor
		.use(mqpacker)
		.use(calc({ precision: 8 }))
		.use(autoprefixer);

	if (!isDev) {
		processor.use(cssnano(cssnanoOptions));
	}
};

export default async (files, config = {}) => {
	if (!files.length) {
		return;
	}

	log.info('>> Building styles...', LOG_TITLE);

	if (!processor) {
		configure(config);
	}

	try {
		await Promise.all(
			files.map(async (file) => {
				const source = await readFile(file, 'utf-8');
				const { css } = await processor.process(source, {
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

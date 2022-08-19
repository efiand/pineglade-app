import { cssnanoConfig, isDev } from '../constants.js';
import autoprefixer from 'autoprefixer';
import calc from 'postcss-calc';
import cssnano from 'cssnano';
import customMedia from 'postcss-custom-media';
import easyImport from 'postcss-easy-import';
import functions from 'postcss-functions';
import log from './log.js';
import mixins from 'postcss-mixins';
import mqpacker from 'postcss-sort-media-queries';
import nested from 'postcss-nested';
import path from 'path';
import postcss from 'postcss';
import processGlobs from './processGlobs.js';
import { readFile } from 'fs/promises';
import simpleVars from 'postcss-simple-vars';
import writeFile from './writeFile.js';

const LOG_TITLE = 'Build styles';

const processor = postcss();

const addPlugins = (config = {}) => {
	processor.use(easyImport).use(simpleVars).use(mixins).use(nested);

	if (config.functions) {
		processor.use(functions({
			functions: config.functions
		}))
	}
	if (config.customMedia) {
		processor.use( customMedia(config.customMedia))
	}

	processor.use(mqpacker).use(calc).use(autoprefixer);

	if (!isDev) {
		processor.use(cssnano(cssnanoConfig));
	}
};

export default async (config) => {
	log.info('>> Start building CSS...', LOG_TITLE);

	if (!processor.plugins.length) {
		addPlugins(config);
	}

	try {
		const sources = await processGlobs(Pattern.CSS_ENTRIES);

		await Promise.all(
			sources.map(async (source) => {
				const sourceCSS = await readFile(source, 'utf-8');
				const { css } = await processor.process(sourceCSS, {
					from: 'undefined',
					map: false
				});

				const bundleName = path.basename(source, '.css');
				await writeFile(`${Dest.CSS}/${bundleName}.bundle.css`, css);
			})
		);

		log.success('<< CSS files successfully builded', LOG_TITLE);
	} catch (err) {
		log.error(err, LOG_TITLE);
	}
};

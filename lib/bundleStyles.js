import { cssnanoOptions, isDev } from '../constants.js';
import autoprefixer from 'autoprefixer';
import calc from 'postcss-calc';
import cssnano from 'cssnano';
import customMedia from 'postcss-custom-media';
import easyImport from 'postcss-easy-import';
import functions from 'postcss-functions';
import mixins from 'postcss-mixins';
import mqpacker from 'postcss-sort-media-queries';
import nested from 'postcss-nested';
import path from 'path';
import postcss from 'postcss';
import { readFile } from 'fs/promises';
import simpleVars from 'postcss-simple-vars';
import writeFile from './writeFile.js';

const processor = postcss();

const addPlugins = (config = {}) => {
	processor.use(easyImport()).use(simpleVars).use(mixins).use(nested);

	if (config.functions) {
		processor.use(
			functions({
				functions: config.functions
			})
		);
	}
	if (config.customMedia) {
		processor.use(customMedia(config.customMedia));
	}

	processor.use(mqpacker).use(calc).use(autoprefixer);

	if (!isDev) {
		processor.use(cssnano(cssnanoOptions));
	}
};

export default async ({ config, dest, entry }) => {
	if (!processor.plugins.length) {
		addPlugins(config);
	}

	const sourceCSS = await readFile(entry, 'utf-8');
	const { css } = await processor.process(sourceCSS, {
		from: entry,
		map: false
	});

	const bundleName = path.basename(entry, '.css');
	await writeFile(`${dest}/${bundleName}.bundle.css`, css);
};

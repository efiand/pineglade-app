import {
	CWD,
	Dest,
	Pattern,
	isDev as dev,
	terserOptions
} from '../constants.js';
import TerserPlugin from 'terser-webpack-plugin';
import getPathsFromGlobs from '../lib/getPathsFromGlobs.js';
import log from '../lib/log.js';
import path from 'path';
import webpack from 'webpack';

const LOG_TITLE = 'Webpack';

const alias = {
	'@': path.resolve(CWD, Pattern.SOURCE),
	svelte: path.resolve(CWD, 'node_modules/svelte')
};

const createConfig = ({ custom, generate = 'dom' }) => {
	return {
		mode: dev ? 'development' : 'production',
		module: {
			rules: [
				{
					test: /\.svelte$/,
					use: {
						loader: 'svelte-loader',
						options: {
							compilerOptions: {
								css: false,
								dev,
								generate,
								hydratable: true
							}
						}
					}
				},
				{
					resolve: {
						fullySpecified: false
					},
					test: /node_modules\/svelte\/.*\.mjs$/
				}
			]
		},
		optimization: {
			minimize: !dev,
			minimizer: [
				new TerserPlugin({
					extractComments: false,
					parallel: true,
					terserOptions
				})
			]
		},
		resolve: {
			alias
		},
		...custom
	};
};

const createEntryConfig = (entry) => {
	if (entry.endsWith('.svelte')) {
		return createConfig({
			custom: {
				entry,
				experiments: {
					outputModule: true
				},
				output: {
					filename: Dest.SSR_BUNDLE_NAME,
					library: {
						type: 'module'
					},
					path: Dest.APP_OUTPUT
				}
			},
			generate: 'ssr'
		});
	}

	return createConfig({
		custom: {
			entry,
			output: {
				filename: `${path.basename(entry, path.extname(entry))}.bundle.js`,
				path: Dest.JS
			}
		}
	});
};

export default async (globs, silent = false) => {
	if (!silent) {
		log.info('>> Building scripts...', LOG_TITLE);
	}

	const files = await getPathsFromGlobs(globs);
	if (!files.length) {
		return;
	}

	return await new Promise((resolve, reject) => {
		webpack(files.map(createEntryConfig), (err, stats) => {
			if (err) {
				log.error(err, LOG_TITLE);

				if (err.details) {
					log.error(err.details, LOG_TITLE, true);
					reject(err.details);
				}

				reject(err);
			}

			const { errors, warnings } = stats.toJson();

			if (stats.hasErrors()) {
				errors.forEach((error) => log.error(error, LOG_TITLE));
			}

			if (stats.hasWarnings()) {
				warnings.forEach(({ message }) => log.warn(message, LOG_TITLE));
			}

			if (!silent) {
				log.success('<< Scripts successfully builded.', LOG_TITLE);
			}
			resolve();
		});
	});
};

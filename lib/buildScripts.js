import {
	Dest,
	Pattern,
	isDev as dev,
	mode,
	terserOptions
} from '../constants.js';
import TerserPlugin from 'terser-webpack-plugin';
import getFullPath from './getFullPath.js';
import log from './log.js';
import processGlobs from './processGlobs.js';
import webpack from 'webpack';

const LOG_TITLE = 'Build scripts';
const alias = {
	'@': getFullPath(Pattern.SOURCE),
	svelte: getFullPath('node_modules/svelte')
};
const path = getFullPath(Dest.JS);

const createConfig = ({ custom, generate = 'dom' }) => {
	return {
		mode,
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

export default () =>
	new Promise(async (resolve, reject) => {
		log.info('>> Start building scripts...', LOG_TITLE);

		const entries = await processGlobs(Pattern.JS_ENTRIES);

		const configs = entries.map((entry) => {
			if (entry.endsWith('.svelte')) {
				return createConfig({
					custom: {
						entry,
						experiments: {
							outputModule: true
						},
						output: {
							filename: 'ssr.bundle.js',
							library: {
								type: 'module'
							},
							path
						}
					},
					generate: 'ssr'
				});
			}

			return createConfig({
				custom: {
					entry,
					output: {
						filename: '[name].bundle.js',
						path
					}
				}
			});
		});

		webpack(configs, (err, stats) => {
			if (err) {
				log.error(err, LOG_TITLE);

				if (err.details) {
					log.error(({ blue }) => [`[${blue(LOG_TITLE)}]`, err.details]);
				}

				reject(err.details);
			}

			const { errors, warnings } = stats.toJson();

			if (stats.hasErrors()) {
				errors.forEach((error) => log.error(error, LOG_TITLE));
			}

			if (stats.hasWarnings()) {
				warnings.forEach(({ message }) => log.warn(message, LOG_TITLE));
			}

			if (!stats.hasErrors() && !stats.hasWarnings()) {
				log.success('<< Scripts successfully builded', LOG_TITLE);
			}
			resolve();
		});
	});

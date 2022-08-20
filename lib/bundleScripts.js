import {
	Pattern,
	appPath,
	isDev as dev,
	mode,
	terserOptions
} from '../constants.js';
import TerserPlugin from 'terser-webpack-plugin';
import getFullPath from './getFullPath.js';
import log from './log.js';
import webpack from 'webpack';

const alias = {
	'@': getFullPath(Pattern.SOURCE),
	svelte: getFullPath('node_modules/svelte')
};

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

const createConfigMapper = (path) => (entry) => {
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
					path: appPath
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
};

export default ({ entries, dest: path, logTitle }) => {
	return new Promise((resolve, reject) => {
		const mapConfig = createConfigMapper(path);
		const configs = entries.map(mapConfig);

		webpack(configs, (err, stats) => {
			if (err) {
				log.error(err, logTitle);

				if (err.details) {
					log.error(({ blue }) => [`[${blue(logTitle)}]`, err.details]);
				}

				reject(err.details);
			}

			const { errors, warnings } = stats.toJson();

			if (stats.hasErrors()) {
				errors.forEach((error) => log.error(error, logTitle));
			}

			if (stats.hasWarnings()) {
				warnings.forEach(({ message }) => log.warn(message, logTitle));
			}

			resolve();
		});
	});
};

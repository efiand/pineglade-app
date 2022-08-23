import { Dest, Pattern, host } from '../constants.js';
import browserSync from 'browser-sync';
import buildScripts from './buildScripts.js';
import buildSprite from './buildSprite.js';
import buildStyles from './buildStyles.js';
import copyFiles from './copyFiles.js';
import createImages from './createImages.js';
import lintMarkdown from './lintMarkdown.js';
import lintScripts from './lintScripts.js';
import lintSpaces from './lintSpaces.js';
import lintStyles from './lintStyles.js';
import nodemon from 'nodemon';
import processPages from './processPages.js';

const devServer = browserSync.create();
let isInit = false;

const initialWatchers = [
	{
		async fn() {
			await lintSpaces(Pattern.EDITORCONFIG);
		},
		match: Pattern.EDITORCONFIG
	},
	{
		async fn() {
			await lintMarkdown(Pattern.MD);
		},
		match: Pattern.MD
	},
	{
		async fn() {
			await lintStyles(Pattern.CSS);
		},
		match: Pattern.CSS
	},
	{
		async fn() {
			await lintScripts(Pattern.JS);
		},
		match: Pattern.JS
	},
	{
		async fn() {
			await buildStyles(Pattern.CSS_ENTRIES);
			devServer.reload();
		},
		match: Pattern.CSS_ENTRIES
	},
	{
		async fn() {
			await copyFiles(Pattern.PIXELPERFECT);
			devServer.reload();
		},
		match: Pattern.PIXELPERFECT
	},
	{
		async fn(evt) {
			if (evt === 'unlink') {
				return;
			}

			await createImages(Pattern.IMAGES_PLACE, true);
			devServer.reload();
		},
		match: Pattern.IMAGES_PLACE
	},
	{
		async fn() {
			await buildSprite(Pattern.ICONS);
			devServer.reload();
		},
		match: Pattern.ICONS
	}
];

const getWatchers = (config) => {
	const watchers = [...initialWatchers];

	if (config.server) {
		watchers.push({
			match: '.app/restart.log'
		});
	}

	if (config.layout) {
		watchers.push({
			async fn() {
				await buildScripts([Pattern.JS_SERVER, Pattern.JS_CLIENT]);
				await processPages(Pattern.HTML);
				devServer.reload();
			},
			match: [Pattern.APP_CONFIG, ...Pattern.ENGINE]
		});
	} else {
		watchers.push({
			match: `${Dest.MAIN}/**/*.html`
		});
		watchers.push({
			async fn() {
				await buildScripts(Pattern.JS_CLIENT);
				devServer.reload();
			},
			match: Pattern.JS_CLIENT
		});
	}

	return watchers;
};

const startServer = (config) => {
	if (isInit) {
		return;
	}

	const serverOptions = {
		cors: true,
		files: getWatchers(config),
		open: false,
		ui: false
	};

	if (config.server) {
		serverOptions.proxy = host;
	} else {
		serverOptions.server = Dest.MAIN;
	}

	devServer.init(serverOptions);

	isInit = true;
};

export default (config) => {
	if (config.server) {
		return nodemon({
			ext: 'js',
			script: './app',
			watch: ['app']
		}).on('start', () => startServer(config));
	}

	startServer(config);
};

import { Dest, host } from '../constants.js';
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

const rebuild = async (_file, files, config) => {
	if (config.routes) {
		await buildScripts(files.ssrEntries, true);
		if (!config.server) {
			await processPages(config);
		}
	}
	return devServer.reload();
};

const typeHandlers = {
	async icons(file, files) {
		await buildSprite(files.icons);
		return devServer.reload();
	},
	layouts: rebuild,
	markdowns(file) {
		lintMarkdown([file]);
	},
	async pixelperfectImages(file, files) {
		await copyFiles(files.pixelperfectImages);
		return devServer.reload();
	},
	async rawImages(file) {
		await createImages([file], true);
		return devServer.reload();
	},
	async scripts(file, files, config) {
		await Promise.all([lintScripts([file]), buildScripts(files.scriptEntries)]);
		return await rebuild(file, files, config);
	},
	sources: lintSpaces,
	async styles(file, files) {
		await Promise.all([lintStyles([file]), buildStyles(files.styleEntries)]);
		return devServer.reload();
	}
};

const watchFile = ({ config, files, stateFile, unstateFile }) => {
	return async (evt, file) => {
		if (evt === 'addDir' || evt === 'unlinkDir') {
			return;
		}
		if (evt === 'unlink') {
			return unstateFile(file);
		}
		if (evt === 'add') {
			stateFile(file);
		}

		let promise = null;
		for (const type of Object.keys(files)) {
			if (typeHandlers[type] && files[type].includes(file)) {
				promise = typeHandlers[type];
			}
		}
		return await promise(file, files, config);
	};
};

const startServer = (app) => {
	if (isInit) {
		return;
	}

	const serverOptions = {
		cors: true,
		files: [
			{
				match: '.app/restart.log'
			},
			{
				fn: watchFile(app),
				match: 'source/**/*'
			}
		],
		open: false,
		ui: false
	};

	if (app.config.server) {
		serverOptions.proxy = host;
	} else {
		serverOptions.server = Dest.MAIN;
	}

	devServer.init(serverOptions);

	isInit = true;
};

export default (app) => {
	if (app.config.server) {
		return nodemon({
			ext: 'js',
			script: './app',
			watch: ['app']
		}).on('start', () => startServer(app));
	}

	startServer(app);
};

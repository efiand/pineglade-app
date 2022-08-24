import { CWD, host as proxy } from '../constants.js';
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
import path from 'path';

const devServer = browserSync.create();

const typeHandlers = {
	async icons(file, { files }) {
		await buildSprite(files.icons);
		return devServer.reload();
	},
	async layouts(file, { processHtml }) {
		await processHtml();
		return devServer.reload();
	},
	markdowns(file) {
		lintMarkdown([file]);
	},
	async pixelperfectImages(file, { files }) {
		await copyFiles(files.pixelperfectImages);
		return devServer.reload();
	},
	async rawImages(file) {
		await createImages([file], true);
		return devServer.reload();
	},
	async scripts(file, { files, processHtml }) {
		await Promise.all([
			lintScripts([file]),
			buildScripts(files.scriptEntries),
			processHtml()
		]);
		return devServer.reload();
	},
	sources(file) {
		lintSpaces([file]);
	},
	async styles(file, { files }) {
		await Promise.all([lintStyles([file]), buildStyles(files.styleEntries)]);
		return devServer.reload();
	}
};

const watchFile = ({ config, files, processHtml, stateFile, unstateFile }) => {
	return async (evt, file) => {
		file = path.resolve(CWD, file).replace(/\\/g, '/');

		if (evt === 'addDir' || evt === 'unlinkDir') {
			return;
		}
		if (evt === 'unlink') {
			return unstateFile(file);
		}
		if (evt === 'add') {
			stateFile(file);
		}

		return await Promise.all(
			Object.keys(files)
				.map((type) => {
					if (typeHandlers[type] && files[type].includes(file)) {
						return typeHandlers[type](file, { config, files, processHtml });
					}
					return null;
				})
				.filter(Boolean)
		);
	};
};

export default (app) => {
	devServer.init({
		cors: true,
		files: [
			{
				fn: watchFile(app),
				match: 'source/**/*'
			}
		],
		open: false,
		proxy,
		ui: false
	});
};

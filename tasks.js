import { Dest } from './constants.js';
import bundleScripts from './lib/bundleScripts.js';
import bundleStyles from './lib/bundleStyles.js';
import createTask from './lib/createTask.js';
import processCreateImages from './lib/createWebImages.js';
import processLintScripts from './lib/lintScripts.js';
import processLintSpaces from './lib/lintSpaces.js';
import processLintStyles from './lib/lintStyles.js';

export const createWebImages = createTask({
	clean: true,
	dest: Dest.IMAGES,
	logTitle: 'Create images',
	processBulk: processCreateImages
});

export const buildScripts = createTask({
	dest: Dest.JS,
	logTitle: 'Build scripts',
	processBulk: bundleScripts
});

export const buildStyles = createTask({
	dest: Dest.CSS,
	logTitle: 'Build styles',
	processOne: bundleStyles
});

export const lintScripts = createTask({
	logTitle: 'Lint scripts',
	processBulk: processLintScripts
});

export const lintSpaces = createTask({
	logTitle: 'Editorconfig',
	processOne: processLintSpaces
});

export const lintStyles = createTask({
	logTitle: 'Lint styles',
	processBulk: processLintStyles,
	usseGlob: false
});

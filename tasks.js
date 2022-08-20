import { Dest, Pattern } from './constants.js';
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
	pattern: Pattern.IMAGES_PLACE,
	processOne: processCreateImages
});

export const buildScripts = createTask({
	dest: Dest.JS,
	logTitle: 'Build scripts',
	pattern: Pattern.JS_ENTRIES,
	processBulk: bundleScripts
});

export const buildStyles = createTask({
	dest: Dest.CSS,
	logTitle: 'Build styles',
	pattern: Pattern.CSS_ENTRIES,
	processOne: bundleStyles
});

export const lintScripts = createTask({
	logTitle: 'Lint scripts',
	pattern: [Pattern.JS_BUILDABLES, Pattern.JS_BUILDABLES],
	processBulk: processLintScripts
});

export const lintSpaces = createTask({
	logTitle: 'Editorconfig',
	pattern: Pattern.EDITORCONFIG,
	processOne: processLintSpaces
});

export const lintStyles = createTask({
	logTitle: 'Lint styles',
	pattern: Pattern.CSS_LINTABLES,
	processBulk: processLintStyles,
	usseGlob: false
});

// Проверка кода самого приложения
export const lintSelf = async () =>
	await Promise.all([
		lintScripts(['*.js', '**/*.js']),
		lintSpaces(['*.{js,json,md}', '.*', '**/*'])
	]);

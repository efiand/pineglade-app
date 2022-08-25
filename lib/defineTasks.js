import { Dest, Pattern } from '../constants.js';
import bundleScripts from './bundleScripts.js';
import bundleStyles from './bundleStyles.js';
import lintScriptsProcessor from './lintScripts.js';
import lintSpacesProcessor from './lintSpaces.js';
import processTask from './processTask.js';

export default (config = {}) => {
	const buildScripts = processTask({
		bulkProcessor: bundleScripts,
		dest: Dest.JS,
		logTitle: 'Build scripts',
		pattern: Pattern.JS_ENTRIES
	});

	const buildStyles = processTask({
		config: config.postcss,
		dest: Dest.CSS,
		logTitle: 'Build styles',
		pattern: Pattern.CSS_ENTRIES,
		processor: bundleStyles
	});

	const lintScripts = processTask({
		bulkProcessor: lintScriptsProcessor,
		logTitle: 'Lint scripts',
		pattern: [Pattern.JS_BUILDABLES, Pattern.JS_BUILDABLES]
	});

	const lintSpaces = processTask({
		logTitle: 'Editorconfig',
		pattern: Pattern.EDITORCONFIG,
		processor: lintSpacesProcessor
	});

	// Проверка кода самого приложения
	const lintSelf = async () => await Promise.all([
		lintScripts(['*.js', '**/*.js']),
		lintSpaces(['*.{js,json,md}', '.*', '**/*'])
	]);

	return {
		buildScripts,
		buildStyles,
		lintScripts,
		lintSelf,
		lintSpaces
	};
};

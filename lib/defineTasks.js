import { Dest, Pattern } from '../constants.js';
import bundleScripts from './bundleScripts.js';
import bundleStyles from './bundleStyles.js';
import lintScripts from './lintScripts.js';
import processTask from './processTask.js';

export default (config) => ({
	buildScripts: processTask({
		bulkProcessor: bundleScripts,
		dest: Dest.JS,
		logTitle: 'Build scripts',
		pattern: Pattern.JS_ENTRIES
	}),

	buildStyles: processTask({
		config: config.postcss,
		dest: Dest.CSS,
		logTitle: 'Build styles',
		pattern: Pattern.CSS_ENTRIES,
		processor: bundleStyles
	}),

	lintScripts: processTask({
		bulkProcessor: lintScripts,
		logTitle: 'Lint scripts',
		pattern: [Pattern.JS_BUILDABLES, Pattern.JS_BUILDABLES]
	})
});

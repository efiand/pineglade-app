import { Pattern, isCompile, isSelf } from './constants.js';
import defineTasks from './lib/defineTasks.js';
import getFullPath from './lib/getFullPath.js';
import log from './lib/log.js';

(async () => {
	let config = {};

	try {
		config = await import(`file://${getFullPath('app.config.js')}`).then(
			(data) => data.default
		);
	} catch (err) {
		log.warn(
			'app.config.js not found, default configuration used',
			'Start app'
		);
	}

	const { buildScripts, buildStyles, lintScripts } = defineTasks(config);

	if (isCompile) {
		await Promise.all([buildScripts(), buildStyles()]);
	} else if (isSelf) {
		await lintScripts(Pattern.JS_LINTABLES_SELF);
	}
})();

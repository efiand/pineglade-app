import { isCompile, isDev, isSelf } from './constants.js';
import defineTasks from './lib/defineTasks.js';
import getFullPath from './lib/getFullPath.js';
import log from './lib/log.js';

(async () => {
	if (isSelf) {
		return await defineTasks().lintSelf();
	}

	let config = {};
	try {
		config = await import(`file://${getFullPath('app.config.js')}`).then(
			(data) => data.default
		);
	} catch (err) {
		log.warn('No config found, use internals', 'Pineglade app');
	}

	const { buildScripts, buildStyles, lintScripts, lintSpaces } =
		defineTasks(config);

	if (!isDev) {
		await Promise.all([lintSpaces(), lintScripts()]);
	}

	if (isCompile) {
		await Promise.all([buildScripts(), buildStyles()]);
	}
})();

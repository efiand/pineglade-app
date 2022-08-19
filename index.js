import { isCompile } from './constants.js';
import buildScripts from './lib/buildScripts.js';
import buildStyles from './lib/buildStyles.js';
import getFullPath from './lib/getFullPath.js';

(async () => {
	let config = {};

	try {
		config = await import(getFullPath('app.config.js'));
	} catch (err) {}

	if (isCompile) {
		await Promise.all([buildScripts(), buildStyles(config.postcss)]);
	}
})();

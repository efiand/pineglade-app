import { isCompile, isSelf, isTest } from './constants.js';
import app from './lib/app.js';

(async () => {
	await app.configure();

	if (isSelf) {
		return await app.lintSelf();
	}

	// Тестируем приложение перед сборкой
	if (isCompile || isTest) {
		await Promise.all([app.lintSpaces(), app.lintScripts()]);
	}

	if (isCompile) {
		await Promise.all([app.buildScripts(), app.buildStyles()]);
	}
})();

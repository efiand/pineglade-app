import { isCompile, isSelf, isTest } from './constants.js';
import App from './lib/app.js';

(async () => {
	const app = new App();
	await app.configure();

	if (isSelf) {
		return await app.lintSelf();
	}

	// Тестируем приложение перед сборкой
	if (isCompile || isTest) {
		await Promise.all([app.lintSpaces(), app.lintScripts(), app.lintStyles()]);
	}

	if (isCompile) {
		await Promise.all([
			app.buildScripts(),
			app.buildStyles(),
			app.createWebImages()
		]);
	}
})();

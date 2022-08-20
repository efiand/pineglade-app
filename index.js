import { Pattern, isCompile, isSelf, isTest } from './constants.js';
import App from './lib/App.js';

(async () => {
	const app = new App();
	await app.configure();

	if (isSelf) {
		return await Promise.all([
			app.lintScripts(['*.js', '**/*.js']),
			app.lintSpaces(['*.{js,json,md}', '.*', '**/*'])
		]);
	}

	// Тестируем приложение перед сборкой
	if (isCompile || isTest) {
		await Promise.all([
			app.lintSpaces(Pattern.EDITORCONFIG),
			app.lintScripts([Pattern.JS_BUILDABLES, Pattern.JS_LINTABLES]),
			app.lintStyles(Pattern.CSS_LINTABLES)
		]);
	}

	if (isCompile) {
		await Promise.all([
			app.buildScripts(Pattern.JS_ENTRIES),
			app.buildStyles(Pattern.CSS_ENTRIES),
			app.createWebImages(Pattern.IMAGES_PLACE)
		]);
	}
})();

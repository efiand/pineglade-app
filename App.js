import { Pattern, appName, isBuild, isLint, isSelf, isTest } from './constants.js';
import buildScripts from './tasks/buildScripts.js';
import buildSprite from './tasks/buildSprite.js';
import buildStyles from './tasks/buildStyles.js';
import createImages from './tasks/createImages.js';
import getConfig from './tasks/getConfig.js';
import lint from './tasks/lint.js';
import log from './lib/log.js';
import processPages from './tasks/processPages.js';

const START_MESSAGE =
	'>> Starting... See https://github.com/efiand/pineglade-app';

export default class App {
	config;

	async #build() {
		await Promise.all([
			buildScripts(Pattern.JS_CLIENT),
			buildStyles(Pattern.CSS_ENTRIES, this.config.postcss),
			createImages(Pattern.IMAGES_PLACE, true),
			buildSprite(Pattern.ICONS)
		]);
	}

	async #test() {
		await buildScripts(Pattern.JS_SERVER, true);
		this.config = await getConfig();

		if (isBuild || isTest) {
			await processPages(this.config);
		}
	}

	async run() {
		log.info(START_MESSAGE, appName);

		try {
			if (isSelf) {
				log.warn('Self-test mode.', appName);
			}

			await lint();
			if (isLint) {
				return;
			}

			await this.#test();
			if (isTest) {
				return;
			}

			await this.#build();
		} catch (err) {
			log.error(err, appName);
		}
	}
}

import { Pattern, cssnanoOptions, isWatcher } from '../constants.js';
import LinterApp from './LinterApp.js';
import autoprefixer from 'autoprefixer';
import buildScripts from '../lib/buildScripts.js';
import buildStyles from '../lib/buildStyles.js';
import calc from 'postcss-calc';
import createImages from '../lib/createImages.js';
import cssnano from 'cssnano';
import easyImport from 'postcss-easy-import';
import mixins from 'postcss-mixins';
import mqpacker from 'postcss-sort-media-queries';
import nested from 'postcss-nested';
import postcss from 'postcss';
import postcssFunctions from 'postcss-functions';
import postcssMedia from 'postcss-custom-media';
import simpleVars from 'postcss-simple-vars';

export default class BuilderApp extends LinterApp {
	#postcss = postcss();

	async #initPostcss() {
		const { customMedia = null, functions = null } = this.config.postcss;

		this.#postcss.use(easyImport).use(simpleVars).use(mixins);

		if (functions) {
			this.#postcss.use(
				postcssFunctions({
					functions
				})
			);
		}

		this.#postcss.use(nested);

		if (customMedia) {
			this.#postcss.use(postcssMedia(customMedia));
		}

		this.#postcss.use(mqpacker).use(calc).use(autoprefixer);

		if (!isWatcher) {
			this.#postcss.use(cssnano(cssnanoOptions));
		}
	}

	async run() {
		await super.run();
		await this.#initPostcss();

		await Promise.all([
			buildScripts(Pattern.JS_CLIENT),
			buildStyles(Pattern.CSS_ENTRIES, this.#postcss),
			createImages(Pattern.IMAGES_PLACE)
		]);
	}
}

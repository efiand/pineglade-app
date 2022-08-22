import { ExitCode, HttpMethod, Pattern, isSelf } from '../constants.js';
import { eslintConfig, stylelintConfig } from 'pineglade-config';
import { ESLint } from 'eslint';
import buildScripts from '../lib/buildScripts.js';
import getPathsFromGlobs from '../lib/getPathsFromGlobs.js';
import handleHtmlRoute from '../lib/handleHtmlRoute.js';
import lintMarkdown from '../lib/lintMarkdown.js';
import lintScripts from '../lib/lintScripts.js';
import lintSpaces from '../lib/lintSpaces.js';
import lintStyles from '../lib/lintStyles.js';
import log from '../lib/log.js';
import processPages from '../lib/processPages.js';
import readFileSmart from '../lib/readFileSmart.js';

const eslintOptions = {
	allowInlineConfig: false
};

export default class LinterApp {
	#eslint;

	#stylelintConfig;

	name = 'Pineglade';

	async #initConfig() {
		this.config = await readFileSmart('app.config.js', 'import', {});

		this.config.add = (payload) => {
			Object.entries(payload).forEach(([key, value]) => {
				if (typeof this.config[key] === 'undefined') {
					this.config[key] = value;
				}
			});
		};

		const [layout, ssrBundle] = await Promise.all([
			readFileSmart(Pattern.LAYOUT, 'html', ''),
			readFileSmart(Pattern.SSR_BUNDLE, 'import')
		]);

		if (!layout || !ssrBundle) {
			throw new Error('No layout assets!');
		}

		this.config.add({
			layout,
			postcss: {},
			props: {},
			routes: [],
			serverRoutes: [],
			ssrBundle
		});

		if (this.config.props.name) {
			this.name = this.config.props.name;
		}

		if (!this.config.routes.length) {
			await this.#configureRoutesFromDir();
		}
	}

	async #configureRoutesFromDir() {
		const routes = await getPathsFromGlobs(Pattern.HTML, false);

		if (!routes.length) {
			log.warn('Routes not found. Are you using static HTML pages?', this.name);
			return;
		}

		this.config.routes = routes.map((route) => ({
			generate: true,
			handler: handleHtmlRoute,
			method: HttpMethod.GET,
			url: route.replace(/source\/components\/pages(.+)\.svelte/, '$1')
		}));
	}

	async #initEslint() {
		const baseConfig = await Promise.all([
			readFileSmart('.eslintrc.cjs', 'import'),
			readFileSmart('.eslintrc', 'json'),
			readFileSmart('.eslintrc.js', 'import'),
			readFileSmart('.eslintrc.json', 'json')
		]).then((results) => results.find(Boolean) || eslintConfig);

		this.#eslint = new ESLint({
			...eslintOptions,
			baseConfig
		});
	}

	async #initStylelint() {
		this.#stylelintConfig = await Promise.all([
			readFileSmart('stylelint.config.cjs', 'import'),
			readFileSmart('.stylelintrc', 'json'),
			readFileSmart('stylelint.config.js', 'import'),
			readFileSmart('package.json', 'json').then((config) => config.stylelint)
		]).then((results) => results.find(Boolean) || stylelintConfig);
	}

	async run() {
		log.info(
			'>> Starting... See https://github.com/efiand/pineglade-app',
			this.name
		);
		if (isSelf) {
			log.warn('Self-test mode.', this.name);
		}

		try {
			await this.#initEslint();

			log.info('>> Linting begins...', this.name);

			await Promise.all([
				lintMarkdown(Pattern.MD),
				lintScripts(Pattern.JS, this.#eslint),
				lintSpaces(Pattern.EDITORCONFIG)
			]);

			if (!isSelf) {
				await buildScripts(Pattern.JS_SERVER, true);
				await Promise.all([this.#initConfig(), this.#initStylelint()]);

				await Promise.all([
					lintStyles(Pattern.CSS, this.#stylelintConfig),
					processPages(this.config)
				]);
			}

			if (process.exitCode !== ExitCode.ERROR) {
				log.success(
					'<< There are no codeguide and validation errors.',
					this.name
				);
			}
		} catch (err) {
			log.error(err, this.name);
		}
	}
}

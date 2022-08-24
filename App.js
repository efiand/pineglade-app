import {
	TypePattern,
	appName,
	isBuild,
	isDev,
	isLint,
	isSelf
} from './constants.js';
import buildScripts from './tasks/buildScripts.js';
import buildSprite from './tasks/buildSprite.js';
import buildStyles from './tasks/buildStyles.js';
import copyFiles from './tasks/copyFiles.js';
import createImages from './tasks/createImages.js';
import { deleteAsync } from 'del';
import glob from 'glob';
import lintMarkdown from './tasks/lintMarkdown.js';
import lintScripts from './tasks/lintScripts.js';
import lintSpaces from './tasks/lintSpaces.js';
import lintStyles from './tasks/lintStyles.js';
import log from './lib/log.js';
import { mapSvelteRoute } from './lib/routes.js';
import processPages from './tasks/processPages.js';
import readFileSmart from './lib/readFileSmart.js';
import watch from './tasks/watch.js';

const START_MESSAGE =
	'>> Starting... See https://github.com/efiand/pineglade-app';
const DEV_SCRIPT = 'source/scripts/dev.js';

const globConfig = {
	mark: true,
	nodir: true,
	realpath: true
};

const selfFilesPattern = '{lib/,tasks/,tools/,A,R,c,i}*.{js,md}';
const appFilesPattern =
	'source/**/*.{css,html,jpg,js,json,md,png,svelte,svg,webp}';
const filesPattern = isSelf ? selfFilesPattern : appFilesPattern;
const typePaterns = Object.entries(TypePattern);
const deleteOnStart = ['.app', '**/*.bundle.*'];

export default class App {
	config = {
		devScript: null,
		layout: null,
		postcss: {},
		props: {},
		routes: [],
		server: false,
		ssrBundle: null
	};

	files = typePaterns.reduce(
		(obj, [key]) => ({
			...obj,
			[key]: []
		}),
		{}
	);

	stateFile = this.#stateFile.bind(this);

	unstateFile = this.#unstateFile.bind(this);

	async #build() {
		if (this.config.routes.length) {
			deleteOnStart.push('public/**/*.html');
		}
		await deleteAsync(deleteOnStart);

		await Promise.all([
			buildScripts(this.files.scriptEntries),
			buildStyles(this.files.styleEntries, this.config.postcss),
			createImages(this.files.rawInages, true),
			buildSprite(this.files.icons)
		]);
	}

	async #configure() {
		if (this.files.configs.length) {
			const config = await readFileSmart(this.files.configs[0], 'import', {});
			this.config = {
				...this.config,
				...config
			};
		}

		if (!this.config.routes.length) {
			if (this.files.routeEntries.length) {
				this.config.routes = this.files.routeEntries.map(mapSvelteRoute);
			} else {
				return;
			}
		}

		if (this.files.ssrEntries.length && this.files.layouts.length) {
			await buildScripts(this.files.ssrEntries, true);

			const [layout, ssrBundle] = Promise.all([
				readFileSmart(this.files.ssrEntries[0], 'import'),
				readFileSmart(this.files.layouts[0])
			]);

			if (layout && ssrBundle) {
				this.config.layout = layout;
				this.config.ssrBundle = ssrBundle;

				const hasDevScript = Boolean(
					this.files.scriptEntries.find((entry) => entry.endsWith(DEV_SCRIPT))
				);
				if (isDev && !this.config.devScript && hasDevScript) {
					this.config.devScript = DEV_SCRIPT;
				}
			}
		}
	}

	async #fillFiles() {
		const flatList = await new Promise((resolve, reject) => {
			glob(filesPattern, globConfig, (err, files) => {
				if (err) {
					reject(err);
				}
				resolve(files);
			});
		});

		flatList.forEach(this.stateFile);
	}

	async #lint() {
		lintMarkdown(this.files.markdowns);
		lintSpaces(this.files.sources);

		await Promise.all([
			lintScripts(this.files.scripts),
			lintStyles(this.files.styles)
		]);
	}

	async #processHtml() {
		if (!this.config.routes) {
			return;
		}

		await processPages(this.config);
	}

	#stateFile(file) {
		file = file.replace(/\\/g, '/');

		typePaterns.forEach(([type, pattern]) => {
			if (pattern.test(file) && !this.files[type].includes(file)) {
				this.files[type].push(file);
			}
		});
	}

	#unstateFile(file) {
		file = file.replace(/\\/g, '/');

		typePaterns.forEach(([type]) => {
			if (this.files[type].includes(file)) {
				this.files[type] = this.files[type].splice(
					this.files[type].indexOf(file),
					1
				);
			}
		});
	}

	async run() {
		log.info(START_MESSAGE, appName);

		try {
			await this.#fillFiles();

			if (isSelf) {
				log.warn('Self-test mode.', appName);
			}

			await Promise.all([this.#lint(), this.#configure()]);
			await this.#processHtml();
			if (isLint) {
				return;
			}

			await this.#build();
			if (isBuild) {
				return;
			}

			if (this.config.devScript) {
				await copyFiles(this.files.pixelperfectImages);
			}

			watch(this);
		} catch (err) {
			log.error(err, appName);
		}
	}
}

import {
	APP_NAME,
	Dest,
	TypePattern,
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
import startServer from './tasks/startServer.js';
import watch from './tasks/watch.js';

const START_MESSAGE =
	'>> Starting... See https://github.com/efiand/pineglade-app';
const DEV_SCRIPT = 'source/scripts/dev.js';
const DELETE_ON_START = ['**/*.bundle.*', 'public/pixelperfect'];

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
const ssrBundleDest = `${Dest.APP_OUTPUT}/${Dest.SSR_BUNDLE_NAME}`;

const defaultConfig = {
	devScript: null,
	indexUrl: '/index.html',
	layout: null,
	notFoundUrl: '/404.html',
	postcss: {},
	routes: [],
	ssrBundle: null
};

export default class App {
	config = defaultConfig;

	files = typePaterns.reduce(
		(obj, [key]) => ({
			...obj,
			[key]: []
		}),
		{}
	);

	constructor() {
		this.started = false;

		this.processHtml = this.#processHtml.bind(this);
		this.stateFile = this.#stateFile.bind(this);
		this.unstateFile = this.#unstateFile.bind(this);
	}

	#addRoutes() {
		this.config.routes = this.files.routeEntries.map(mapSvelteRoute(this));

		const rootRoute = this.config.routes.find(({ url }) => url === '/');

		if (!rootRoute) {
			const indexRoute = this.config.routes.find(
				({ url }) => url === this.config.indexUrl
			);
			if (indexRoute) {
				this.config.routes.push({
					...indexRoute,
					generate: false,
					url: '/'
				});
			}
		}
	}

	async #build() {
		await deleteAsync(DELETE_ON_START);

		await Promise.all([
			buildScripts(this.files.scriptEntries),
			buildStyles(this.files.styleEntries, this.config.postcss),
			createImages(this.files.rawInages, true),
			buildSprite(this.files.icons)
		]);
	}

	async #configure() {
		if (this.files.configs.length) {
			const config = await readFileSmart(
				`${this.files.configs[0]}?${Date.now()}`,
				'import',
				{}
			);
			this.config = {
				...defaultConfig,
				...config
			};
		}

		if (!this.config.routes.length) {
			if (this.files.routeEntries.length) {
				this.#addRoutes();
			} else {
				return log.warn(
					'No routes. Do you use static HTML in public folder?',
					APP_NAME
				);
			}
		}

		if (!this.files.layouts.length) {
			return;
		}
		this.config.layout = await readFileSmart(this.files.layouts[0]);

		const hasDevScript = Boolean(
			this.files.scriptEntries.find((entry) => entry.endsWith(DEV_SCRIPT))
		);
		if (isDev && this.config.layout && !this.config.devScript && hasDevScript) {
			this.config.devScript = DEV_SCRIPT;
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
		await this.#configure();

		if (!this.config.layout) {
			return log.warn(
				'No layout. Do you use static HTML in public folder?',
				APP_NAME
			);
		}

		if (this.config.routes.length && !this.started) {
			await deleteAsync([ssrBundleDest, 'public/**/*.html']);
		}

		await buildScripts(this.files.ssrEntries, true);

		this.config.ssrBundle = await readFileSmart(ssrBundleDest, 'import');

		if (!isDev) {
			await processPages(this.config);
		}
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
		log.info(START_MESSAGE, APP_NAME);

		try {
			await this.#fillFiles();

			if (isSelf) {
				log.warn('Self-test mode.', APP_NAME);
			}

			await Promise.all([this.#lint(), this.#processHtml()]);
			if (isLint) {
				return;
			}

			await this.#build();
			if (isBuild) {
				return;
			}

			await startServer(this);
			this.started = true;
			if (!isDev) {
				return;
			}

			if (this.config.devScript) {
				await copyFiles(this.files.pixelperfectImages);
			}
			watch(this);
		} catch (err) {
			log.error(err, APP_NAME);
		}
	}
}

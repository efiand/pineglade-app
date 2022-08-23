import { Pattern, isDev } from '../constants.js';
import buildScripts from './buildScripts.js';
import getPathsFromGlobs from '../lib/getPathsFromGlobs.js';
import log from '../lib/log.js';
import { mapSvelteRoute } from '../lib/routes.js';
import readFileSmart from '../lib/readFileSmart.js';

const LOG_TITLE = 'Config';

const DEFAUT_CONFIG = {
	postcss: {},
	props: {},
	routes: [],
	server: false
};

const getNecessary = async (pattern, type = 'text') => {
	const result = await readFileSmart(pattern, type);
	if (!result) {
		throw new Error(`No nesessary ${pattern}!`);
	}
	return result;
};

export default async () => {
	const userConfig = await readFileSmart(Pattern.APP_CONFIG, 'import', {});

	if (!Object.keys(userConfig).length) {
		log.warn(
			`${Pattern.APP_CONFIG} is missing. Standard will be used.`,
			LOG_TITLE
		);
	}

	const config = { ...DEFAUT_CONFIG, ...userConfig };

	if (isDev && !config.devScript) {
		const hasDevScript = await readFileSmart(Pattern.JS_DEV);
		if (hasDevScript) {
			config.devScript = Pattern.JS_DEV;
		}
	}

	if (!config.routes.length) {
		const routes = await getPathsFromGlobs(Pattern.HTML, false);

		if (routes.length) {
			config.routes = routes.map(mapSvelteRoute);
		} else {
			log.warn('Routes not found. Are you using static HTML pages?', LOG_TITLE);
			return;
		}
	}

	config.layout = await getNecessary(Pattern.LAYOUT);

	await buildScripts(Pattern.JS_SERVER, true);
	config.ssrBundle = await getNecessary(Pattern.SSR_BUNDLE, 'import');

	return config;
};

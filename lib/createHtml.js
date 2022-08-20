import { Dest, cssnanoOptions, isDev, terserOptions } from '../constants.js';
import { lintBem, svgoConfig } from 'pineglade-config';
import htmlnano from 'htmlnano';
import log from './log.js';
import setConfig from './setConfig.js';
import { validateHtml } from 'pineglade-w3c';

const htmlnanoOptions = {
	collapseWhitespace: 'aggressive',
	minifyCss: cssnanoOptions,
	minifyJs: terserOptions,
	minifySvg: svgoConfig,
	removeComments: 'safe'
};

const config = {
	lang: 'en',
	layout: ''
};

export const setupHtml = async ({
	lang = 'en',
	layoutName = 'source/index.html'
} = {}) => {
	config.lang = lang;

	config.layout = await setConfig(layoutName, config.layout);
	if (!config.layout) {
		config.layout = await setConfig('index.html', '', true);
	}

	config.ssrBundle = await setConfig(Dest.SSR_BUNDLE_NAME, null, true);
};

export default async (props = {}, forceTest = false) => {
	const { lang, ssrBundle } = config;
	const { head = '', html = '' } = ssrBundle ? ssrBundle.render(props) : {};

	const data = {
		head,
		html: `${html}<script>window.props = ${JSON.stringify(props)}</script>`,
		lang
	};
	const content = config.layout.replace(
		/(<!--\s*)?{(.+?)}(\s*-->)?/g,
		(all, pre, key) => data[key]
	);

	if (isDev || forceTest) {
		lintBem({
			content,
			exit: false,
			log,
			name: props.url
		});

		const output = await validateHtml({
			forceOffline: true,
			htmlCode: content,
			sourceName: props.url
		});
		if (output) {
			log.error(() => [output.trim()]);
		}
	}

	if (!isDev) {
		const minified = await htmlnano.process(content, htmlnanoOptions);
		return minified.html;
	}

	return content;
};

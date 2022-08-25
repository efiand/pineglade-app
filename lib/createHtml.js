import { cssnanoOptions, isDev, terserOptions } from '../constants.js';
import getAntiCashQuery from './getAntiCashQuery.js';
import htmlnano from 'htmlnano';
import { svgoConfig } from 'pineglade-config';
import validateHtml from './validateHtml.js';

const htmlnanoOptions = {
	collapseWhitespace: 'aggressive',
	minifyCss: cssnanoOptions,
	minifyJs: terserOptions,
	minifySvg: svgoConfig,
	removeComments: 'safe'
};

const getDevScriptCode = (devScript, root) => {
	if (!isDev || !devScript) {
		return '';
	}
	return `<script src="${root}scripts/${devScript}${getAntiCashQuery()}" defer></script>`;
};

export default async ({
	devScript,
	getProps = async (url) => ({ url }),
	layout,
	minify = !isDev,
	root = '/',
	ssrBundle,
	templateData = {},
	url,
	validate = isDev
} = {}) => {
	if (!url) {
		throw new Error('No URL!');
	}
	if (!layout) {
		throw new Error('No layout!');
	}
	if (!ssrBundle) {
		throw new Error('No SSR bundle!');
	}

	const props = await getProps(url);
	const { head = '', html = '' } = ssrBundle.render(props);

	const data = {
		...templateData,
		antiCashQuery: getAntiCashQuery(),
		body: `${html}<script>window.props = ${JSON.stringify(props)}</script>`,
		devScript: getDevScriptCode(devScript, root),
		head
	};
	const content = layout
		.replace(/\s*\/>/g, '>')
		.replace(/(<!--\s*)?{(.+?)}(\s*-->)?/g, (all, pre, key) => data[key]);

	if (validate) {
		await validateHtml(content, url);
	}

	if (minify) {
		const minified = await htmlnano.process(content, htmlnanoOptions);
		return minified.html;
	}

	return content;
};

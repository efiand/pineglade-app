import { cssnanoOptions, isWatcher, terserOptions } from '../constants.js';
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

export default async ({
	layout = '',
	minify = !isWatcher,
	props = {},
	ssrBundle,
	url,
	validate = isWatcher
} = {}) => {
	const { head = '', html = '' } = ssrBundle.render({ ...props, url });

	const data = {
		body: `${html}<script>window.props = ${JSON.stringify(props)}</script>`,
		head
	};
	const content = layout.replace(
		/(<!--\s*)?{(.+?)}(\s*-->)?/g,
		(all, pre, key) => data[key]
	);

	if (validate) {
		await validateHtml(content, url);
	}

	if (minify) {
		const minified = await htmlnano.process(content, htmlnanoOptions);
		return minified.html;
	}

	return content;
};

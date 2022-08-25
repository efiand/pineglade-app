import { cssnanoOptions, isDev, terserOptions } from '../constants.js';
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
	devScript,
	getProps = async (url) => ({ url }),
	layout,
	minify = !isDev,
	ssrBundle,
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
		body: `${html}<script>window.props = ${JSON.stringify(props)}</script>`,
		head
	};
	let content = layout.replace(
		/(<!--\s*)?{(.+?)}(\s*-->)?/g,
		(all, pre, key) => data[key]
	);
	if (isDev && devScript) {
		content = content.replace(
			'</body>',
			`<script src="scripts/${devScript}"></script></body>`
		);
	}

	if (validate) {
		await validateHtml(content, url);
	}

	if (minify) {
		const minified = await htmlnano.process(content, htmlnanoOptions);
		return minified.html;
	}

	return content;
};

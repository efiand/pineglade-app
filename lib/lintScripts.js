import log from './log.js';

export default async (globs, eslint) => {
	const results = await eslint.lintFiles(globs);
	const formatter = await eslint.loadFormatter('stylish');

	if (results.filter(({ messages }) => messages.length).length) {
		log.error(formatter.format(results), 'Eslint', true);
	}
};

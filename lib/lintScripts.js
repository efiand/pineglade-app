import { ESLint } from 'eslint';
import log from './log.js';

const eslint = new ESLint({
	allowInlineConfig: false,
	globInputPaths: false
});

export default async ({ entries, logTitle }) => {
	const results = await eslint.lintFiles(entries);
	const formatter = await eslint.loadFormatter('stylish');

	if (results.filter(({ messages }) => messages.length).length) {
		log.error(({ blue }) => [`[${blue(logTitle)}]`, formatter.format(results)]);
	}
};

import { ESLint } from 'eslint';
import { eslintConfig } from 'pineglade-config';
import log from '../lib/log.js';
import readFileSmart from '../lib/readFileSmart.js';

const LOG_TITLE = 'Eslint';
let eslint = null;

const configure = async () => {
	const baseConfig = await Promise.all([
		readFileSmart('.eslintrc.cjs', 'import'),
		readFileSmart('.eslintrc', 'json'),
		readFileSmart('.eslintrc.js', 'import'),
		readFileSmart('.eslintrc.json', 'json')
	]).then((results) => {
		const userConfig = results.find(Boolean);

		if (userConfig) {
			return userConfig;
		}

		log.warn(
			'There is no eslint configuration, the built-in will be used.',
			LOG_TITLE
		);
		return eslintConfig;
	});

	eslint = new ESLint({
		allowInlineConfig: false,
		baseConfig,
		globInputPaths: false
	});
};

export default async (files) => {
	log.info('>> Checking scripts...', LOG_TITLE);

	if (!eslint) {
		await configure();
	}

	const results = await eslint.lintFiles(files);
	const formatter = await eslint.loadFormatter('stylish');

	if (results.filter(({ messages }) => messages.length).length) {
		log.error(formatter.format(results), LOG_TITLE, true);
	} else {
		log.success('<< Scripts successfully checked.', LOG_TITLE);
	}
};

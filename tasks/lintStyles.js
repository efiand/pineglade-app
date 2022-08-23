import log from '../lib/log.js';
import readFileSmart from '../lib/readFileSmart.js';
import stylelint from 'stylelint';
import { stylelintConfig } from 'pineglade-config';

const LOG_TITLE = 'Stylelint';
let config = null;

const configure = async () => {
	config = await Promise.all([
		readFileSmart('stylelint.config.cjs', 'import'),
		readFileSmart('.stylelintrc', 'json'),
		readFileSmart('stylelint.config.js', 'import'),
		readFileSmart('package.json', 'json').then((pkg) => pkg.stylelint)
	]).then((results) => {
		const userConfig = results.find(Boolean);

		if (userConfig) {
			return userConfig;
		}

		log.warn(
			'There is no stylelint configuration, the built-in will be used.',
			LOG_TITLE
		);
		return stylelintConfig;
	});
};

export default async (files) => {
	log.info('>> Checking styles...', LOG_TITLE);

	if (!config) {
		await configure();
	}

	const { errored, output } = await stylelint.lint({
		allowEmptyInput: true,
		config,
		files,
		formatter: 'string'
	});

	if (errored) {
		log.info('', LOG_TITLE);
		log.error(output.trim(), '', true);
	} else {
		log.success('<< Styles successfully checked.', LOG_TITLE);
	}
};

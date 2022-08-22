import log from './log.js';
import stylelint from 'stylelint';

const LOG_TITLE = 'Stylelint';

export default async (files, config) => {
	try {
		const { errored, output } = await stylelint.lint({
			allowEmptyInput: true,
			config,
			files,
			formatter: 'string'
		});

		if (errored) {
			log.info('', LOG_TITLE);
			log.error(output.trim(), '', true);
		}
	} catch (err) {
		log.error(err, LOG_TITLE);
	}
};

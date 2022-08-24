import log from '../lib/log.js';
import markdownlint from 'markdownlint';

const LOG_TITLE = 'Markdownlint';

export default (files) => {
	if (!files.length) {
		return;
	}

	log.info('>> Checking markdown files...', LOG_TITLE);

	markdownlint(
		{
			config: {
				default: true,
				'line-length': false
			},
			files
		},
		(info, errorData) => {
			Object.entries(errorData).forEach(([file, errors]) => {
				if (errors.length) {
					errorData[file] = errors
						.map((error) => ({
							code: error.ruleDescription,
							line: error.lineNumber,
							message: error.errorDetail,
							type: 'error'
						}))
						.sort((errA, errB) => errA.line - errB.line);
				} else {
					delete errorData[file];
				}
			});

			if (Object.keys(errorData).length) {
				return log.items(errorData, LOG_TITLE);
			}
			log.success('<< Markdown files successfully checked.', LOG_TITLE);
		}
	);
};

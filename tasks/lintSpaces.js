import Validator from 'lintspaces';
import log from '../lib/log.js';

const LOG_TITLE = 'Lintspaces';

export default (files) => {
	if (!files.length) {
		return;
	}

	log.info('>> Checking spaces with editorconfig...', LOG_TITLE);

	const validator = new Validator({ editorconfig: '.editorconfig' });
	files.forEach((file) => validator.validate(file));

	const result = validator.getInvalidFiles();
	const resultEntries = Object.entries(result);

	if (resultEntries.length) {
		resultEntries.forEach(([file, errors]) => {
			result[file] = Object.values(errors).flat();
		});

		return log.items(result, 'Editorconfig');
	}

	log.success('<< Spaces successfully checked.', LOG_TITLE);
};

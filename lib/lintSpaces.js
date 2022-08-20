import Validator from 'lintspaces';
import log from './log.js';

const createItemLogger =
	(counter) =>
	([file, errors]) => {
		log.error(({ underline }) => [underline(file)]);

		log.error(({ dim, red, yellow }) => {
			const entries = [];

			Object.values(errors).forEach((reply) => {
				reply.forEach(({ code, line, message, type }) => {
					if (type === 'error') {
						type = red(type);
						counter.errors++;
					} else {
						type = yellow(type);
						counter.warnings++;
					}

					const params = [
						`  ${dim(line)}`,
						type,
						message,
						dim(code.toLowerCase())
					];

					entries.push(params.join('  '));
				});
			});

			return [entries.join('\n')];
		});
	};

export default ({ entry, logTitle }) => {
	const validator = new Validator({
		editorconfig: '.editorconfig'
	});
	validator.validate(entry);

	const results = Object.entries(validator.getInvalidFiles());

	if (!results.length) {
		return;
	}

	log.error('', logTitle);
	const counter = {
		errors: 0,
		warnings: 0
	};
	const logItem = createItemLogger(counter);

	results.forEach(logItem);

	const totalCounter = counter.errors + counter.warnings;
	const plural = totalCounter === 1 ? '' : 's';

	log.error(({ bold, red }) => [
		'\n',
		bold(
			red(
				`✖ ${totalCounter} problem${plural} (${counter.errors} errors, ${counter.warnings} warnings)`
			)
		)
	]);
};

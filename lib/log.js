import { ExitCode } from '../constants.js';
import chalk from 'chalk';

const { bold, blue, dim, red, underline, yellow } = chalk;
const { error, info, warn } = console;

const output = (payload, title = null, color = null) => {
	const result = payload.stack || payload.message || payload;

	return [
		title ? `[${blue(title)}]` : null,
		color ? chalk[color](result) : result
	].filter(Boolean);
};

const log = {
	error(payload, title, native = false) {
		error(...output(payload, title, !native && 'red'));
		process.exitCode = ExitCode.ERROR;
	},

	info(payload, title, native = false) {
		info(...output(payload, title, !native && 'cyan'));
	},

	success(payload, title) {
		info(...output(payload, title, 'green'));
	},

	warn(payload, title, native = false) {
		warn(...output(payload, title, !native && 'yellow'));
	}
};

log.items = (errorData, logTitle) => {
	const results = Object.entries(errorData);
	if (!results.length) {
		return;
	}

	log.error('', logTitle);
	let errCounter = 0;
	let warnCounter = 0;

	results.forEach(([file, errors]) => {
		log.error(underline(file), '', true);

		errors.forEach(({ code, line, message, type }) => {
			if (type === 'error') {
				type = red(type);
				errCounter++;
			} else {
				type = yellow(type);
				warnCounter++;
			}

			log.error(
				[`  ${dim(line)}`, type, message, dim(code.toLowerCase())].join('  '),
				'',
				true
			);
		});

		log.info('');
	});

	const totalCounter = errCounter + warnCounter;
	const plural = totalCounter === 1 ? '' : 's';
	const colorMethod = errCounter ? red : yellow;

	log.error(
		bold(
			colorMethod(
				`✖ ${totalCounter} problem${plural} (${errCounter} errors, ${warnCounter} warnings)`
			)
		)
	);
};

export default log;

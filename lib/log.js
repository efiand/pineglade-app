import { ExitCode } from '../constants.js';
import chalk from 'chalk';

const { error, info, warn } = console;

const output = (color, payload, title = null) => {
	if (typeof payload === 'function') {
		return payload(chalk);
	}

	if (title) {
		return [`[${chalk.blue(title)}]`, chalk[color](payload)];
	}

	return [chalk[color](payload)];
};

export default {
	error(err, title) {
		process.exitCode = ExitCode.ERROR;
		error(...output('red', err.stack || err, title));
		return true;
	},
	info(payload, title) {
		info(...output('cyan', payload, title));
	},
	success(payload, title) {
		info(...output('green', payload, title));
	},
	warn(payload, title) {
		warn(...output('yellow', payload, title));
	}
};

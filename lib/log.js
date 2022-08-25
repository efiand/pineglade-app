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
		process.exitCode = 1;
		error(...output('red', err.stack || err, title));
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

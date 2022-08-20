import { isSelf } from '../constants.js';
import log from './log.js';
import setConfig from './setConfig.js';
import stylelint from 'stylelint';
import { stylelintConfig } from 'pineglade-config';

let config = null;

export const setupStylelint = async () => {
	if (isSelf) {
		config = stylelintConfig;
		return;
	}
	config = await setConfig('.stylelintrc', stylelintConfig);
};

export default async ({ entries, logTitle }) => {
	const { errored, output } = await stylelint.lint({
		config,
		files: entries,
		formatter: 'string'
	});

	if (!errored) {
		return;
	}

	log.info('', logTitle);
	return log.error(() => [output.trim()]);
};

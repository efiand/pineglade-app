import { ESLint } from 'eslint';
import { eslintConfig } from 'pineglade-config';
import { isSelf } from '../constants.js';
import log from './log.js';
import setConfig from './setConfig.js';

let eslint = null;

export const setupEslint = async () => {
	const baseConfig = isSelf ? eslintConfig : await setConfig('.eslintrc', eslintConfig);

	eslint = new ESLint({
		allowInlineConfig: false,
		baseConfig,
		globInputPaths: false
	});
};

export default async ({ entries, logTitle }) => {
	const results = await eslint.lintFiles(entries);
	const formatter = await eslint.loadFormatter('stylish');

	if (results.filter(({ messages }) => messages.length).length) {
		return log.error(({ blue }) => [
			`[${blue(logTitle)}]`,
			formatter.format(results)
		]);
	}
};

import { ESLint } from 'eslint';
import { appPath } from '../constants.js';
import getFullPath from './getFullPath.js';
import log from './log.js';
import { readFile } from 'fs/promises';

const CONFIG = {
	allowInlineConfig: false,
	globInputPaths: false
};
let eslint = null;

const setupEslint = async (logTitle) => {
	const config = {
		...CONFIG
	};

	let baseConfig = {};
	try {
		baseConfig = await readFile(getFullPath('.eslintrc'), 'utf-8').then(
			JSON.parse
		);
	} catch (err) {
		baseConfig = await readFile(`${appPath}/.eslintrc`, 'utf-8').then(
			JSON.parse
		);
		log.warn('No eslint configuration. Use app defaults', logTitle);
	}

	return new ESLint({ ...config, baseConfig });
};

export default async ({ entries, logTitle }) => {
	if (!eslint) {
		eslint = await setupEslint(logTitle);
	}

	const results = await eslint.lintFiles(entries);
	const formatter = await eslint.loadFormatter('stylish');

	if (results.filter(({ messages }) => messages.length).length) {
		return log.error(({ blue }) => [
			`[${blue(logTitle)}]`,
			formatter.format(results)
		]);
	}
};

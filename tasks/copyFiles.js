import { Dest } from '../constants.js';
import { cp } from 'fs/promises';
import log from '../lib/log.js';
import path from 'path';

const LOG_TITLE = 'Copy';

export default async (files) => {
	if (!files.length) {
		return;
	}

	await Promise.all(
		files.map(async (file) => {
			const subPath = file.replace(/^.*?source(\\|\/)(.*)/, '$2');

			await cp(file, path.resolve(Dest.MAIN, subPath));

			log.success(`${subPath} successfully copied.`, LOG_TITLE);
		})
	);
};

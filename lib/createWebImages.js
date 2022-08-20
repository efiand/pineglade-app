import { basename, extname } from 'path';
import log from './log.js';
import processSquoosh from './processSquoosh.js';
import { readFile } from 'fs/promises';

export default async ({ entry, dest, logTitle }) => {
	const fileName = basename(entry, extname(entry));
	const file = await readFile(entry);

	try {
		await processSquoosh({ dest, file, fileName });
		return;
	} catch (err) {
		return log.error(err, logTitle);
	}
};

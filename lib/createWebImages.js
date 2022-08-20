import { basename, extname } from 'path';
import log from './log.js';
import processRaster from './processRaster.js';
import processVector from './processVector.js';
import { readFile } from 'fs/promises';

const processOne = async ({ dest, entries, i, logTitle }) => {
	if (i === entries.length) {
		return;
	}
	const entry = entries[i];
	log.info(`>> Optimize ${entry}...`, logTitle);

	const extName = extname(entry);
	const isSvg = extName === '.svg';
	const fileName = isSvg ? basename(entry) : basename(entry, extName);
	const file = await (isSvg ? readFile(entry, 'utf-8') : readFile(entry));

	try {
		if (fileName.endsWith('.svg')) {
			await processVector({ dest, file, fileName });
		} else {
			await processRaster({ dest, file, fileName });
		}

		log.success(`<< Success ${entry}`, logTitle);

		await processOne({ dest, entries, i: i + 1, logTitle });
	} catch (err) {
		return log.error(err, logTitle);
	}
};

export default async ({ dest, entries, logTitle }) => {
	// Последовательная обработка, чтобы пулы не сожрали память
	return await processOne({ dest, entries, i: 0, logTitle });
};

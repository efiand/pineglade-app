import { basename, extname } from 'path';
import getPathsFromGlobs from './getPathsFromGlobs.js';
import log from './log.js';
import processRaster from './processRaster.js';
import processVector from './processVector.js';
import { readFile } from 'fs/promises';

const LOG_TITLE = 'Squoosh';

const createImage = async (entries, i) => {
	if (i === entries.length) {
		return;
	}
	const entry = entries[i];
	log.info(`>> Optimize ${entry}...`, LOG_TITLE);

	const extName = extname(entry);
	const isSvg = extName === '.svg';
	const fileName = isSvg ? basename(entry) : basename(entry, extName);
	const file = await (isSvg ? readFile(entry, 'utf-8') : readFile(entry));

	try {
		if (fileName.endsWith('.svg')) {
			await processVector(file, fileName);
		} else {
			await processRaster(file, fileName);
		}

		log.success(`<< Success ${entry}`, LOG_TITLE);

		await createImage(entries, i + 1);
	} catch (err) {
		return log.error(err, LOG_TITLE);
	}
};

export default async (globs) => {
	const files = await getPathsFromGlobs(globs);
	if (!files.length) {
		return;
	}

	// Sequential processing to prevent pools from gobbling up memory.
	return await createImage(globs, 0);
};

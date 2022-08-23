import { basename, extname } from 'path';
import getPathsFromGlobs from '../lib/getPathsFromGlobs.js';
import log from '../lib/log.js';
import processRaster from '../lib/processRaster.js';
import processVector from '../lib/processVector.js';
import { readFile } from 'fs/promises';

const LOG_TITLE = 'Squoosh';

const createImage = async (entries, i) => {
	if (i === entries.length) {
		return;
	}
	const entry = entries[i];
	log.info(`>> Optimizing image ${entry}...`, LOG_TITLE);

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

		log.success(`<< ${entry} successfully optimized`, LOG_TITLE);

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

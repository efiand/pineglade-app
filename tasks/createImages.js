import { deleteAsync } from 'del';
import getPathsFromGlobs from '../lib/getPathsFromGlobs.js';
import log from '../lib/log.js';
import minifySvg from '../lib/minifySvg.js';
import path from 'path';
import processSquoosh from '../lib/processSquoosh.js';
import { readFile } from 'fs/promises';

const createImage = async (entries, i, del) => {
	if (i === entries.length) {
		return;
	}

	const entry = entries[i];
	const entryName = path.basename(entry);
	const extName = path.extname(entry);
	const isSvg = extName === '.svg';
	const logTItle = isSvg ? 'SVGO' : 'Squoosh';

	log.info(`>> Optimizing ${entryName}...`, logTItle);

	const fileName = isSvg ? entryName : path.basename(entry, extName);
	const file = await (isSvg ? readFile(entry, 'utf-8') : readFile(entry));

	try {
		if (fileName.endsWith('.svg')) {
			await minifySvg(file, fileName);
		} else {
			await processSquoosh(file, fileName);
		}

		if (del) {
			await deleteAsync(entry);
		}

		log.success(`<< ${entryName} successfully optimized.`, logTItle);

		await createImage(entries, i + 1, del);
	} catch (err) {
		return log.error(err, logTItle);
	}
};

export default async (globs, del = false) => {
	const files = await getPathsFromGlobs(globs);
	if (!files.length) {
		return;
	}

	// Sequential processing to prevent pools from gobbling up memory.
	return await createImage(files, 0, del);
};

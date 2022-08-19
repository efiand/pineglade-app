import { mkdir, stat, writeFile } from 'fs/promises';
import { dirname } from 'path';
import getFullPath from './getFullPath.js';

export default async (file, content) => {
	const fullPath = getFullPath(file);
	const dirName = dirname(fullPath);

	try {
		await stat(dirName);
	} catch (err) {
		await mkdir(dirName);
	}

	return await writeFile(fullPath, content);
};

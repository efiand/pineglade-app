import { dirname, resolve } from 'path';
import { mkdir, stat, writeFile } from 'fs/promises';
import { CWD } from '../constants.js';

export default async (file, content) => {
	const fullPath = resolve(CWD, file);
	const dirName = dirname(fullPath);

	try {
		await stat(dirName);
	} catch (err) {
		if (err.code === 'ENOENT') {
			await mkdir(dirName, { recursive: true });
		}
	}

	return await writeFile(fullPath, content);
};

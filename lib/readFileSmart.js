import { CWD } from '../constants.js';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

// Read files in different formats with error handling.

export default async (fileName, type = 'text', fallback = null) => {
	const file = resolve(CWD, fileName);

	try {
		if (type === 'import') {
			return await import(`file://${file}`).then((data) => data.default);
		}
		if (type === 'json') {
			return await readFile(file, 'utf-8').then(JSON.parse);
		}
		return await readFile(file, 'utf-8');
	} catch (err) {
		return fallback;
	}
};

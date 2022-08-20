import { appName, appPath } from '../constants.js';
import getFullPath from './getFullPath.js';
import log from './log.js';
import { readFile } from 'fs/promises';

export default async (fileName, fallback, isInternal = false) => {
	const source = isInternal ? `${appPath}/${fileName}` : getFullPath(fileName);

	try {
		if (fileName.endsWith('.js')) {
			return await import(`file://${source}`).then(
				(data) => data.default
			);
		}

		const file = await readFile(source, 'utf-8');
		if (fileName.endsWith('rc')) {
			return JSON.parse(file);
		}

		return file;
	} catch (err) {
		log.warn(`No ${fileName} configuration. Use defaults`, appName);
	}

	return fallback;
};

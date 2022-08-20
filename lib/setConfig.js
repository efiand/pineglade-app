import { appName, isSelf } from '../constants.js';
import getFullPath from './getFullPath.js';
import log from './log.js';
import { readFile } from 'fs/promises';

export default async (fileName, fallback) => {
	if (!isSelf) {
		try {
			if (fileName.endsWith('.js')) {
				return await import(`file://${getFullPath(fileName)}`).then(
					(data) => data.default
				);
			}
			return await readFile(getFullPath(fileName), 'utf-8').then(JSON.parse);
		} catch (err) {
			log.warn(`No ${fileName} configuration. Use defaults`, appName);
		}
	}

	return fallback;
};

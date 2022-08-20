import { deleteAsync } from 'del';
import ensureArray from '../tools/ensureArray.js';
import log from './log.js';
import processGlobs from './processGlobs.js';

const processing = async ({
	dest,
	entries,
	logTitle,
	processBulk,
	processOne
}) => {
	if (typeof processBulk === 'function') {
		return await processBulk({ dest, entries, logTitle });
	} else if (typeof processOne === 'function') {
		return await Promise.all(
			entries.map(async (entry) => await processOne({ dest, entry, logTitle }))
		).then((errors) => {
			return errors.filter(Boolean).length;
		});
	}
};

const createTask = ({
	clean = false,
	dest = null,
	entries = null,
	logTitle = null,
	pattern = null,
	processBulk = null,
	processOne = null
}) => {
	return async (overridePattern = null) => {
		let hasErrors = false;
		let globs = ensureArray(entries || overridePattern || pattern).flat(
			Infinity
		);
		const visuallyGlobs = globs.join(', ');

		log.info(`>> Begin ${visuallyGlobs}...`, logTitle);

		try {
			if (!entries) {
				globs = await processGlobs(globs);
			}

			hasErrors = await processing({
				dest,
				entries: globs,
				logTitle,
				processBulk,
				processOne
			});

			if (clean) {
				hasErrors = await createTask({
					entries: globs,
					logTitle: `${logTitle} cleaning`,
					processOne: deleteAsync
				})();
			}

			if (!hasErrors) {
				log.success(`<< Successfully end ${visuallyGlobs}`, logTitle);
			}
		} catch (err) {
			log.error(err, logTitle);
		}

		// Передаем ошибки в родительский процесс
		return hasErrors;
	};
};

export default createTask;

import { deleteAsync } from 'del';
import ensureArray from '../tools/ensureArray.js';
import log from './log.js';
import processGlobs from './processGlobs.js';

const processing = async ({
	bulkProcessor,
	dest,
	entries,
	logTitle,
	processor
}) => {
	if (typeof bulkProcessor === 'function') {
		return await bulkProcessor({ dest, entries, logTitle });
	} else if (typeof processor === 'function') {
		return await Promise.all(
			entries.map(async (entry) => await processor({ dest, entry, logTitle }))
		).then((errors) => {
			return errors.filter(Boolean).length;
		});
	}
};

const processTask = ({
	bulkProcessor = null,
	clean = false,
	dest = null,
	entries = null,
	logTitle = null,
	pattern = null,
	processor = null
}) => {
	return async (overridePattern = null) => {
		let hasErrors = false;
		const globs = ensureArray(overridePattern || entries || pattern);
		const visuallyGlobs = globs.flat(Infinity).join(', ');

		log.info(`>> Begin ${visuallyGlobs}...`, logTitle);

		try {
			if (!entries) {
				entries = await processGlobs(globs);
			}

			hasErrors = await processing({
				bulkProcessor,
				dest,
				entries,
				logTitle,
				processor
			});

			if (clean) {
				hasErrors = await processTask({
					logTitle: `${logTitle} cleaning`,
					processor: deleteAsync
				})(globs);
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

export default processTask;

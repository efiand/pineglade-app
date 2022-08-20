import { deleteAsync } from 'del';
import ensureArray from '../tools/ensureArray.js';
import log from './log.js';
import processGlobs from './processGlobs.js';

const processTask = ({
	bulkProcessor = null,
	clean = false,
	dest = null,
	logTitle = null,
	pattern = null,
	processor = null
}) => {
	return async (overridePattern = null) => {
		let hasErrors = false;
		const globs = ensureArray(overridePattern || pattern);
		const visuallyGlobs = globs.join(', ');

		log.info(`>> Begin ${visuallyGlobs}...`, logTitle);

		try {
			const entries = await processGlobs(globs);

			if (typeof bulkProcessor === 'function') {
				hasErrors = await bulkProcessor({ dest, entries, logTitle });
			} else if (typeof processor === 'function') {
				await Promise.all(
					entries.map(
						async (entry) => await processor({ dest, entry, logTitle })
					)
				).then((errors) => {
					hasErrors = errors.filter(Boolean).length;
				});
			}

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

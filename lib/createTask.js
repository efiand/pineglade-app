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
	logTitle = null,
	pattern = null,
	processBulk = null,
	processOne = null,
	useGlob = true
}) => {
	return async (overridePattern = null) => {
		let hasErrors = false;
		pattern = ensureArray(overridePattern || pattern).flat(Infinity);
		const visuallyGlobs = pattern.join(', ');

		log.info(`>> Begin ${visuallyGlobs}...`, logTitle);

		try {
			const entries = useGlob ? await processGlobs(pattern) : pattern;

			hasErrors = await processing({
				dest,
				entries,
				logTitle,
				processBulk,
				processOne
			});

			if (clean) {
				hasErrors = await createTask({
					logTitle: `${logTitle} cleaning`,
					pattern,
					processBulk: async ({ entries: dels }) => {
						await deleteAsync(dels);
					},
					useGlob: false
				})();
			}

			if (!hasErrors) {
				log.success(`<< Successfully end ${visuallyGlobs}`, logTitle);
			}
		} catch (err) {
			return log.error(err, logTitle);
		}

		// Передаем ошибки в родительский процесс
		return hasErrors;
	};
};

export default createTask;

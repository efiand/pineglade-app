import { deleteAsync } from 'del';
import ensureArray from '../tools/ensureArray.js';
import log from './log.js';
import processGlobs from './processGlobs.js';

const createTask = ({
	clean = false,
	dest = null,
	logTitle = null,
	processBulk = null,
	processOne = null,
	useGlob = true
}) => {
	return async (pattern = null) => {
		let hasErrors = false;
		pattern = ensureArray(pattern).flat(Infinity);
		const visuallyPattern = pattern.join(', ');
		log.info(`>> Begin ${visuallyPattern}...`, logTitle);

		try {
			const entries = useGlob ? await processGlobs(pattern) : pattern;

			if (typeof processBulk === 'function') {
				hasErrors = await processBulk({ dest, entries, logTitle });
			} else if (typeof processOne === 'function') {
				await Promise.all(
					entries.map(
						async (entry) => await processOne({ dest, entry, logTitle })
					)
				).then((errors) => {
					hasErrors = errors.filter(Boolean).length;
				});
			}

			if (clean) {
				hasErrors = await createTask({
					logTitle: `${logTitle} cleaning`,
					processBulk: async ({ entries: dels }) => {
						await deleteAsync(dels);
					},
					useGlob: false
				})(pattern);
			}

			if (!hasErrors) {
				log.success(`<< Successfully end ${visuallyPattern}`, logTitle);
			}
		} catch (err) {
			return log.error(err, logTitle);
		}

		return hasErrors; // Передаем ошибки в родительский процесс
	};
};

export default createTask;

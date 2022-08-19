import { ExitCode } from '../constants.js';
import { deleteAsync } from 'del';
import ensureArray from '../tools/ensureArray.js';
import log from './log.js';
import processGlobs from './processGlobs.js';

const processTask = ({
	bulkProcessor = null,
	clean = false,
	config = {},
	dest = null,
	logTitle = null,
	pattern = null,
	processor = null
}) => {
	return async (overridePattern = null) => {
		const globs = ensureArray(overridePattern || pattern);
		const visuallyGlobs = globs.join(', ');

		log.info(`>> Begin ${visuallyGlobs}...`, logTitle);

		try {
			const entries = await processGlobs(globs);

			if (typeof bulkProcessor === 'function') {
				await bulkProcessor({ config, dest, entries, logTitle });
			} else if (typeof processor === 'function') {
				await Promise.all(
					entries.map(
						async (entry) => await processor({ config, dest, entry, logTitle })
					)
				);
			}

			if (clean) {
				await processTask({
					logTitle: `${logTitle} cleaning`,
					processor: deleteAsync
				})(globs);
			}

			if (process.exitCode !== ExitCode.ERROR) {
				log.success(`<< Successfully end ${visuallyGlobs}`, logTitle);
			}
		} catch (err) {
			log.error(err, logTitle);
		}
	};
};

export default processTask;

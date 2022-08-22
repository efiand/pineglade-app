import getPathsFromGlobs from './getPathsFromGlobs.js';
import log from './log.js';
import markdownlint from 'markdownlint';

export default async (globs) => {
	const files = await getPathsFromGlobs(globs);

	markdownlint(
		{
			config: {
				default: true,
				'line-length': false
			},
			files
		},
		(info, errorData) => {
			Object.entries(errorData).forEach(([file, errors]) => {
				if (errors.length) {
					errorData[file] = errors
						.map((error) => ({
							code: error.ruleDescription,
							line: error.lineNumber,
							message: error.errorDetail,
							type: 'error'
						}))
						.sort((errA, errB) => errA.line - errB.line);
				} else {
					delete errorData[file];
				}
			});

			log.items(errorData, 'Markdownlint');
		}
	);
};

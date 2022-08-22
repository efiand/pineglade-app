import Validator from 'lintspaces';
import getPathsFromGlobs from './getPathsFromGlobs.js';
import log from './log.js';

export default async (globs) => {
	const files = await getPathsFromGlobs(globs);

	const validator = new Validator({ editorconfig: '.editorconfig' });
	files.forEach((file) => validator.validate(file));

	const result = validator.getInvalidFiles();
	Object.entries(result).forEach(([file, errors]) => {
		result[file] = Object.values(errors).flat();
	});

	log.items(result, 'Editorconfig');
};

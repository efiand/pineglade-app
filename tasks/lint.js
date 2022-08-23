import { Pattern, isSelf } from '../constants.js';
import lintMarkdown from './lintMarkdown.js';
import lintScripts from './lintScripts.js';
import lintSpaces from './lintSpaces.js';
import lintStyles from './lintStyles.js';

export default async () => {
	await Promise.all([
		lintMarkdown(Pattern.MD),
		lintScripts(Pattern.JS),
		lintSpaces(Pattern.EDITORCONFIG)
	]);
	if (isSelf) {
		return;
	}

	await lintStyles(Pattern.CSS);
};

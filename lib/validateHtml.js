import { lintBem } from 'pineglade-config';
import log from './log.js';
import { validateHtml } from 'pineglade-w3c';

const BEM_PATTERN = /class="\w+_/;

export default async (content, sourceName) => {
	if (BEM_PATTERN.test(content)) {
		lintBem({
			content,
			exit: false,
			log,
			name: sourceName
		});
	}

	const output = await validateHtml({
		forceOffline: true,
		htmlCode: content,
		sourceName
	});
	if (output) {
		log.error(output.trim(), '', true);
	}
};

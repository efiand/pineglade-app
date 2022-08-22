import { Dest, isBuilder } from '../constants.js';
import createHtml from './createHtml.js';
import log from './log.js';
import writeFileSmart from './writeFileSmart.js';

const LOG_TITLE = 'Svelte';

export default async ({ layout, props, routes, ssrBundle }) => {
	if (isBuilder) {
		log.info('>> Building pages begins...', LOG_TITLE);
	}
	try {
		await Promise.all(
			routes
				.filter(({ generate }) => generate)
				.map(async ({ url }) => {
					return await createHtml({
						layout,
						props,
						ssrBundle,
						url,
						validate: true
					}).then(async (content) => {
						if (isBuilder) {
							await writeFileSmart(`${Dest.MAIN}${url}`, content);
						}
					});
				})
		);
		if (isBuilder) {
			log.success('<< Pages successfully builded.', LOG_TITLE);
		}
	} catch (err) {
		log.error(err, LOG_TITLE);
	}
};

import { Dest, isBuild, isLint } from '../constants.js';
import createHtml from '../lib/createHtml.js';
import log from '../lib/log.js';
import writeFileSmart from '../lib/writeFileSmart.js';

const LOG_TITLE = 'Svelte';

export default async ({ layout, props, routes, ssrBundle }) => {
	log.info(`>> ${isLint ? 'Testing' : 'Building'} HTML pages...`, LOG_TITLE);

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
						if (isBuild) {
							await writeFileSmart(`${Dest.MAIN}${url}`, content);
						}
					});
				})
		);

		log.success(
			`<< HTML pages successfully ${isLint ? 'tested' : 'builded'}.`,
			LOG_TITLE
		);
	} catch (err) {
		log.error(err, LOG_TITLE);
	}
};

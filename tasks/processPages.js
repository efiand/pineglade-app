import { Dest, isBuild, isLint } from '../constants.js';
import createHtml from '../lib/createHtml.js';
import log from '../lib/log.js';
import writeFileSmart from '../lib/writeFileSmart.js';

const LOG_TITLE = 'Svelte';

export default async (config) => {
	log.info(`>> ${isLint ? 'Testing' : 'Building'} HTML pages...`, LOG_TITLE);

	try {
		await Promise.all(
			config.routes
				.filter(({ generate }) => generate)
				.map(async ({ url }) => {
					return await createHtml({
						...config,
						url,
						validate: true
					}).then(async (content) => {
						if (isBuild) {
							await writeFileSmart(
								`${Dest.MAIN}${url.endsWith('/') ? `${url}index.html` : url}`,
								content
							);
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

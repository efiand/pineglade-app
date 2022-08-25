import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { HttpMethod } from '../constants.js';
import createHtml from './createHtml.js';

export const handleSvelteRoute =
	(app, isNotFound = false) =>
	async ({ url }, reply) => {
		if (isNotFound && url !== app.config.notFoundUrl) {
			reply.code(StatusCodes.NOT_FOUND);
			reply.log.error(
				`${StatusCodes.NOT_FOUND} ${url} ${ReasonPhrases.NOT_FOUND}`
			);
		}

		const content = await createHtml({
			...app.config,
			url: isNotFound ? app.config.notFoundUrl : url
		});
		return reply.type('text/html;charset="utf-8"').send(content);
	};

export const mapSvelteRoute = (app) => (entry) => ({
	generate: true,
	handler: handleSvelteRoute(app),
	method: HttpMethod.GET,
	url: entry.replace(/^.*\/pages(.+?)(index\.html)?\.svelte$/, '$1')
});

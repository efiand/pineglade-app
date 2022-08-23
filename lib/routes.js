import { HttpMethod } from '../constants.js';
import createHtml from './createHtml.js';

export const handleSvelteRoute = async (request, reply) => {
	// The request was decorated by the app.
	const { app, url } = request;
	const { layout, props, ssrBundle } = app.config;

	const content = await createHtml({
		layout,
		props,
		ssrBundle,
		url
	});

	return reply.send(content);
};

export const mapSvelteRoute = (entry) => ({
	generate: true,
	handler: handleSvelteRoute,
	method: HttpMethod.GET,
	url: entry.replace(/source\/components\/pages(.+)\.svelte/, '$1')
});

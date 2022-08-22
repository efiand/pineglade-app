import createHtml from './createHtml.js';

export default async (request, reply) => {
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

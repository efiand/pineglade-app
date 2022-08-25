import { CWD, Dest, host, isDev, port } from '../constants.js';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { handleSvelteRoute } from '../lib/routes.js';
import log from '../lib/log.js';
import path from 'path';

const LOG_TITLE = 'Fastify';

export default async (app) => {
	const server = fastify({
		logger: {
			file: path.resolve(CWD, app.config.serverLog),
			level: isDev ? 'info' : 'warn'
		},
		trustProxy: true
	});

	log.info('>> Starting server...', LOG_TITLE);

	server.register(fastifyStatic, { root: Dest.MAIN });
	server.setNotFoundHandler(handleSvelteRoute(app, true));

	app.config.routes.forEach((route) => server.route(route));

	server.listen({ port });

	log.success(`<< Server successfully started at ${host}`, LOG_TITLE);
};

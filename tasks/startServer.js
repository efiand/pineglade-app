import { CWD, Dest, host, isDev, port } from '../constants.js';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { handleSvelteRoute } from '../lib/routes.js';
import log from '../lib/log.js';
import path from 'path';

const LOG_TITLE = 'Fastify';
const fastifyOptions = {
	logger: {
		file: path.resolve(CWD, '.app/app.log'),
		level: isDev ? 'info' : 'warn'
	},
	trustProxy: true
};

export default async (app) => {
	const server = fastify(fastifyOptions);

	log.info('>> Starting server...', LOG_TITLE);

	server.register(fastifyStatic, { root: Dest.MAIN });
	server.setNotFoundHandler(handleSvelteRoute(app, true));

	app.config.routes.forEach(async (route) => await server.route(route));

	server.listen({ port });

	log.success(`<< Server successfully started at ${host}`, LOG_TITLE);
};

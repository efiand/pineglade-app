import { resolve } from 'path';

export const appName = 'PinegladeApp';

export const [, appPath, script = 'start'] = process.argv;
export const CWD = process.cwd();
export const isSelf = CWD === appPath;
export const isLint = script === 'lint';
export const isBuild = script === 'build';
export const isDev = script === 'dev';

export const DEFAUT_PORT = 1993;
export const port = process.env.PORT || DEFAUT_PORT;
export const host = `${process.env.HOST || 'http://localhost'}:${port}`;

export const ExitCode = {
	ERROR: 1,
	SUCCESS: 0
};

export const HttpMethod = {
	DELETE: 'DELETE',
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT'
};

export const Dest = {
	APP_OUTPUT: resolve(CWD, '.app'),
	CSS: resolve(CWD, 'public/styles'),
	IMAGES: resolve(CWD, 'public/images'),
	JS: resolve(CWD, 'public/scripts'),
	MAIN: resolve(CWD, 'public'),
	SSR_BUNDLE_NAME: 'ssr.bundle.js'
};

export const TypePattern = {
	configs: /app\/config\.js$/,
	icons: /icons\/.+\.svg$/,
	layouts: /source\/layout\.html$/,
	markdowns: /\.md$/,
	pixelperfectImages: /pixelperfect\/.+\.(jpg|png|svg|webp)$/,
	rawInages: /place\/.+\.(jpg|png|svg|webp)$/,
	routeEntries: /pages\/.+\.html\.svelte$/,
	scriptEntries: /scripts(?!.+\/).+\.js$/,
	scripts: /.+\.(js|svelte)$/,
	sources: /\.(css|html|js|json|md|svelte|svg)$/,
	ssrEntries: /components\/Body\.svelte$/,
	styleEntries: /styles\/(?!.+\/).+\.css$/,
	styles: /styles\/.+\.css$/
};

export const cssnanoOptions = {
	preset: [
		'default',
		{ cssDeclarationSorter: false, discardComments: { removeAll: true } }
	]
};

export const terserOptions = {
	format: {
		comments: false
	}
};

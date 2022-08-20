import getFullPath from './lib/getFullPath.js';

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

export const Pattern = {
	CSS_ENTRIES: 'source/styles/*.css',
	CSS_LINTABLES: 'source/styles/**/*.css',
	DEFAULT_IGNORE: ['**/*.bundle.*', '*lock*', 'node_modules/**/*'],
	EDITORCONFIG: ['*.{js,json,md}', '.*', 'source/**/*', '!**/*.{avif,jpg,png,webp}'],
	IMAGES_ICONS: 'source/icons/**/*.svg',
	IMAGES_PLACE: 'source/place/**/*.{jpg,png, svg}',
	JS_BUILDABLES: 'source/**/*.{js,svelte}',
	JS_ENTRIES: ['source/scripts/*.js', 'source/components/Body.svelte'],
	JS_ENTRIES_SERVER: 'source/components/Body.svelte',
	JS_LINTABLES: '*.js',
	SOURCE: 'source'
};

export const Dest = {
	CSS: getFullPath('public/styles'),
	IMAGES: getFullPath('public/images'),
	JS: getFullPath('public/scripts'),
	MAIN: getFullPath('public'),
	SSR_BUNDLE_NAME: 'ssr.bundle.js'
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

export const appName = 'Pineglade app';

export const DEFAUT_PORT = 4444;
export const port = process.env.PORT || DEFAUT_PORT;

export const host = `${process.env.HOST || 'http://localhost'}:${port}`;

export const __dirname = process.cwd();

export const [, appPath, script = 'start'] = process.argv;

export const isBuild = script === 'build';
export const isDev = script === 'dev';
export const isStart = script === 'start';
export const isTest = script === 'test';
export const isSelf = script === 'self';
export const isProd = !isDev;
export const isCompile = isBuild || isDev;

export const mode = isDev ? 'development' : 'production'; // Webpack compatibility

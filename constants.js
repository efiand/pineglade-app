import { resolve } from 'path';

export const appName = 'PinegladeApp';

export const [, appPath, script = 'start'] = process.argv;
export const CWD = process.cwd();
export const isSelf = CWD === appPath;
export const isLint = script === 'lint';
export const isTest = script === 'test';
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

export const Pattern = {
	APP_CONFIG: 'app.config.js',
	CSS: 'source/styles/**/*.css',
	CSS_ENTRIES: 'source/styles/*.css',
	DEFAULT_IGNORES: ['**/*.bundle.*', '*lock*', 'node_modules/**/*'],
	EDITORCONFIG: [
		'.*',
		'**/*',
		'!**/*.{avif,ico,jpg,png,webp,woff,woff2}',
		'!public/**/*.html'
	],
	HTML: ['source/components/pages/**/*.svelte'],
	ICONS: 'source/icons/**/*.svg',
	IMAGES_PLACE: 'source/place/**/*.{jpg,png,svg}',
	JS: ['*.js', '**/*.{js,svelte}'],
	JS_CLIENT: ['source/scripts/*.js', 'source/components/Page.svelte'],
	JS_DEV: 'source/scripts/dev.js',
	JS_SERVER: 'source/components/Page.svelte',
	LAYOUT: 'source/layout.html',
	MD: ['**/*.md'],
	PIXELPERFECT: ['source/pixelperfect/**/*.{jpg,png,svg,webp}'],
	SOURCE: 'source',
	SSR_BUNDLE: '.app/ssr.bundle.js'
};

export const Dest = {
	APP_OUTPUT: resolve(CWD, '.app'),
	CSS: resolve(CWD, 'public/styles'),
	IMAGES: resolve(CWD, 'public/images'),
	JS: resolve(CWD, 'public/scripts'),
	MAIN: resolve(CWD, 'public'),
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

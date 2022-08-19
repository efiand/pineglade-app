export const Pattern = {
	CSS_ENTRIES: 'source/styles/*.css',
	EDITORCONFIG: ['*.{js,json,md}', '.*', 'source/**/*'],
	IMAGES_ICONS: 'source/icons/**/*.svg',
	IMAGES_PLACE: 'source/place/**/*.{jpg,png, svg}',
	JS_BUILDABLES: 'source/**/*.{js,svelte}',
	JS_ENTRIES: ['source/scripts/*.js', 'source/components/Body.svelte'],
	JS_ENTRIES_SERVER: 'source/components/Body.svelte',
	JS_LINTABLES: '*.js',
	SOURCE: 'source'
};

export const Dest = {
	CSS: 'public/styles',
	JS: 'public/scripts',
	IMAGES: 'public/images',
	MAIN: 'public',
	SSR_BUNDLE_NAME: 'ssr.bundle.js'
};

export const terserOptions = {
	format: {
		comments: false
	}
};

export const __dirname = process.cwd();

export const [, appPath, script = 'start'] = process.argv;

export const isBuild = script === 'build';
export const isDev = script === 'dev';
export const isStart = script === 'start';
export const isTest = script === 'test';
export const isProd = !isDev;
export const isCompile = isBuild || isDev;

// webpack compatibility
export const mode = isDev ? 'development' : 'production';

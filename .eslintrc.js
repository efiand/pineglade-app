export default {
	extends: 'pineglade',
	ignorePatterns: ['**/*.bundle.js'],
	overrides: [
		{
			files: ['*.svelte'],
			processor: 'svelte3/svelte3',
			rules: {
				'one-var': 'off',
				'prefer-const': 'off'
			}
		},
		{
			files: 'server/model/**/*.js',
			rules: {
				'max-len': 'off',
				'max-lines': 'off',
				'max-lines-per-function': 'off'
			}
		}
	],
	plugins: ['svelte3']
};

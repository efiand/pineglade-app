import createConfig from './lib/create-config.js';

createConfig().then(({ stylelintConfig }) => {
	console.log(stylelintConfig);
	console.log('hello world');
	console.log(process.argv);
});

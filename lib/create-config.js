import eslintConfig from '../.eslintrc.js';
import stylelintConfig from '../stylelint.config.js';

export default async () => {
	return { eslintConfig, stylelintConfig };
};

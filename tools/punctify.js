export default (str = '', sign = '.') => {
	if (!str) {
		return '';
	}

	const regex = /(\.|\?|!|,|:|…)$/;
	if (regex.test(str)) {
		return str;
	}

	return `${str}${sign}`;
};

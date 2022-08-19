export default (value) => {
	return Array.isArray(value) ? value : [value];
};
